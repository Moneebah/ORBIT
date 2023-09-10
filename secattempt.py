import requests
import cx_Oracle

# Set the details for your Oracle database
dsn_tns = cx_Oracle.makedsn('MLaptop', '1521', service_name='xe')
conn = cx_Oracle.connect(user='system', password='tiger', dsn=dsn_tns)

# Set up a cursor
cursor = conn.cursor()

# Fetch country data from World Bank API
response = requests.get(
    "http://api.worldbank.org/v2/country?format=json&per_page=300", timeout=5)

if response.status_code == 200:
    print("API request successful.")
    json_response = response.json()
else:
    print(f"API request failed with status code {response.status_code}")

countries = response.json()[1]

valid_country_codes = {country['alpha2Code']: country['name']
                       for country in requests.get('https://restcountries.com/v2/all').json()}

for country in countries:
    # Check if it's a valid country
    if country["iso2Code"] not in valid_country_codes:
        continue

    countryId = country["iso2Code"]
    name = country["name"]
    continent = country["region"]["value"]
    capital = country.get("capitalCity", "")

    # Fetch language data from Restcountries API
    language_response = requests.get(
        f"https://restcountries.com/v3.1/alpha/{countryId}")
    language_data = language_response.json()[0]
    languages = ', '.join(language_data['languages'].values())

    print('Inserting country:', countryId, name, languages)

    cursor.execute("""
        INSERT INTO Countries (countryId, name, continent, capital, languages)
        VALUES (:countryId, :name, :continent, :capital, :languages)
    """, countryId=countryId, name=name, continent=continent, capital=capital, languages=languages)
conn.commit()

for year in range(2000, 2022):
    print('YEAR:', year)
    for country in countries:
        countryId = country["iso2Code"]

        if countryId not in valid_country_codes:
            continue

        codes = ["NY.GDP.MKTP.CD", "FP.CPI.TOTL.ZG",
                 "SL.UEM.TOTL.ZS", "DT.DOD.DECT.CD", "SP.POP.TOTL"]
        data = {}

        for code in codes:
            response = requests.get(
                f"http://api.worldbank.org/v2/country/{countryId}/indicator/{code}?date={year}&format=json")
            indicators = response.json()[1]

            if indicators is not None and len(indicators) > 0:
                data[code] = indicators[0]["value"]

        dataId = countryId + str(year)
        print("INSERTING: ", data)

        cursor.execute("""
            INSERT INTO EconomicData (dataId, countryId, year, GDP, inflation, unemployment, externalDebt, population)
            VALUES (:dataId, :countryId, :year, :GDP, :inflation, :unemployment, :externalDebt, :population)
        """, dataId=dataId, countryId=countryId, year=year, GDP=data.get("NY.GDP.MKTP.CD"), inflation=data.get("FP.CPI.TOTL.ZG"), unemployment=data.get("SL.UEM.TOTL.ZS"), externalDebt=data.get("DT.DOD.DECT.CD"), population=data.get("SP.POP.TOTL"))

conn.commit()
conn.close()
