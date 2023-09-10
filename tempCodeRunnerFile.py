import requests
import cx_Oracle
import time
from requests.exceptions import ConnectionError

# Set the details for your Oracle database
dsn_tns = cx_Oracle.makedsn(
    'MLaptop', '1521', service_name='xe')
conn = cx_Oracle.connect(user='system',
                         password='tiger', dsn=dsn_tns)

# Fetch country data from World Bank API
response = requests.get(
    "http://api.worldbank.org/v2/country?per_page=300&format=json")
countries = response.json()[1]

# Define sectors and their respective indicators
sectors_indicators = {
    'AGR': {'name': 'Agriculture', 'indicators': ['NV.AGR.TOTL.ZS', 'SL.AGR.EMPL.ZS']},
    'MAN': {'name': 'Manufacturing', 'indicators': ['NV.IND.MANF.ZS', 'NV.IND.MANF.KD.ZG']},
    'IND': {'name': 'Industry', 'indicators': ['NV.IND.TOTL.ZS', 'NV.IND.TOTL.KD.ZG']},
    'ICT': {'name': 'ICT', 'indicators': ['IT.NET.USER.ZS', 'BX.GSR.CCIS.ZS']},
    'FIN': {'name': 'Financial Sector', 'indicators': ['FS.AST.PRVT.GD.ZS', 'CM.MKT.LCAP.GD.ZS']},
    'TRA': {'name': 'Retail & Wholesale Trade', 'indicators': ['FP.CPI.TOTL', 'TG.VAL.TOTL.GD.ZS']},
    'HEA': {'name': 'Health', 'indicators': ['SH.XPD.CHEX.PC.CD', 'SH.XPD.OOPC.PC.CD']},
    'EDU': {'name': 'Education', 'indicators': ['SE.XPD.TOTL.GD.ZS', 'SE.SEC.ENRR']},
    'ENM': {'name': 'Energy and Mining', 'indicators': ['EG.ELC.ACCS.ZS', 'EG.FEC.RNEW.ZS']}
}

# Set up a cursor
cursor = conn.cursor()
for sector_id, sector_info in sectors_indicators.items():
    # Check if sector ID already exists
    cursor.execute(
        "SELECT SECTORID FROM sectors WHERE SECTORID = :sector_id", sector_id=sector_id)
    result = cursor.fetchone()

    # If sector ID does not exist in the table, insert new record
    if result is None:
        cursor.execute("INSERT INTO sectors (SECTORID, SECTORNAME) VALUES (:1, :2)",
                       (sector_id, sector_info['name']))
        for indicator_code in sector_info['indicators']:
            # Fetch the full name of the indicator
            response = requests.get(
                f"http://api.worldbank.org/v2/indicator/{indicator_code}?format=json")
            response.raise_for_status()
            indicator_name = response.json()[1][0]['name']

            cursor.execute("INSERT INTO indicators (INDICATORID, INDICATORNAME, SECTORID) VALUES (:1, :2, :3)",
                           (indicator_code, indicator_name, sector_id))
    else:
        print(
            f"SECTORID {sector_id} already exists in the sectors table. Skipping...")


conn.commit()


max_retries = 5
retry_delay = 1  # delay in seconds
# Fetch indicator values for each country and year and insert into the countrysectorindicators table
for country in countries:
    country_id = country['iso2Code']  # Change this to iso2Code from id

    # Check if countryId exists in the Countries table
    cursor.execute(
        "SELECT countryId FROM Countries WHERE countryId = :countryId", countryId=country_id)
    result = cursor.fetchone()

    # Skip if country ID not found in the Countries table
    if result is None:
        print(
            f"Country with ID {country_id} not found in the Countries table. Skipping...")
        continue

    print(f"Processing data for country {country_id}...")

    # Define a range of years for which data should be fetched
    from_year = 2010
    to_year = 2021

    for sector_id, sector_info in sectors_indicators.items():
        # Join the indicator codes with ';'
        indicators = ';'.join(sector_info['indicators'])

        # Fetch the indicator values for all years at once
        retries = 0
        while retries < max_retries:
            try:
                response = requests.get(
                    f"http://api.worldbank.org/v2/country/{country_id}/indicator/{indicators}?source=2&date={from_year}:{to_year}&format=json")
                response.raise_for_status()
                break  # if the request is successful, exit the loop
            except ConnectionError:
                print(
                    f"Connection error occurred. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retries += 1
                retry_delay *= 2  # double the delay for each retry

        if retries == max_retries:
            print(
                f"Failed to fetch data for country {country_id} after {max_retries} retries. Skipping...")
            continue

        data = response.json()[1]
        if data is None:
            continue

        for record in data:
            year = record['date']
            indicator = record['indicator']['id']
            value = record['value']

            # Generate a unique ID for each entry
            id = f"{country_id}_{indicator}_{year}"

            # Check if the ID already exists in the database
            cursor.execute(
                "SELECT ID FROM countrysectorindicators WHERE ID = :id", id=id)
            result = cursor.fetchone()

            # If the ID does not exist, insert the data into the database
            if result is None:
                print(f"Inserting data for ID {id}...", {value})
                cursor.execute(
                    "INSERT INTO countrysectorindicators (ID, COUNTRYID, SECTORID, INDICATORID, VALUE, YEARID) VALUES (:1, :2, :3, :4, :5, :6)",
                    (id, country_id, sector_id, indicator, value, int(year)))
            else:
                print(f"ID {id} already exists in the database. Skipping...")

        conn.commit()

    time.sleep(1)  # Be nice to the API

# Close the connection
cursor.close()
conn.close()
