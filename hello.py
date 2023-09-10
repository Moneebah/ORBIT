import requests
import cx_Oracle

# Oracle database connection details
oracle_username = 'system'
oracle_password = 'tiger'
oracle_host = 'MLaptop'
oracle_port = '1521'
oracle_service_name = 'xe'

# World Bank API endpoint for economic indicators and investment data
world_bank_api_url = 'https://api.worldbank.org/v2/country/all/indicator/'

# Specify the economic indicators and investment data to fetch
indicators = [
    'NY.GDP.MKTP.CD',  # GDP
    'FP.CPI.TOTL.ZG',  # Inflation
    'SL.UEM.TOTL.ZS',  # Unemployment
    'DT.DOD.DECT.CD',  # External Debt
    'SP.POP.TOTL'      # Population
]

# Function to retrieve data from the World Bank API


def fetch_data(indicator):
    url = f"{world_bank_api_url}{indicator}?format=json"
    response = requests.get(url)
    json_data = response.json()

    print(json_data)  # Print the entire API response for inspection

    data = []
    if len(json_data) >= 2:
        data.extend(json_data[1])

    return data


# Connect to the Oracle database
dsn = cx_Oracle.makedsn(oracle_host, oracle_port,
                        service_name=oracle_service_name)
connection = cx_Oracle.connect(oracle_username, oracle_password, dsn)

# Insert data into the Oracle database
cursor = connection.cursor()
insert_statement = """
    INSERT INTO EconomicData (dataId, countryId, year, GDP, inflation, unemployment, externalDebt, population)
    VALUES (:data_id, :country_id, :year, :gdp, :inflation, :unemployment, :external_debt, :population)
"""

try:
    for indicator in indicators:
        api_data = fetch_data(indicator)
        for data_row in api_data:
            country_id = data_row['country']['id']
            year = data_row['date']
            value = data_row['value']

            if indicator == 'NY.GDP.MKTP.CD':  # GDP
                gdp = float(value) if value is not None else None
                inflation = None
                unemployment = None
                external_debt = None
                population = None
            elif indicator == 'FP.CPI.TOTL.ZG':  # Inflation
                gdp = None
                inflation = float(value) if value is not None else None
                unemployment = None
                external_debt = None
                population = None
            elif indicator == 'SL.UEM.TOTL.ZS':  # Unemployment
                gdp = None
                inflation = None
                unemployment = float(value) if value is not None else None
                external_debt = None
                population = None
            elif indicator == 'DT.DOD.DECT.CD':  # External Debt
                gdp = None
                inflation = None
                unemployment = None
                external_debt = float(value) if value is not None else None
                population = None
            elif indicator == 'SP.POP.TOTL':  # Population
                gdp = None
                inflation = None
                unemployment = None
                external_debt = None
                population = float(value) if value is not None else None

            data_id = cursor.var(cx_Oracle.NUMBER)
            cursor.execute("SELECT NVL(MAX(dataId), 0) FROM EconomicData")
            max_data_id = cursor.fetchone()[0]
            data_id.setvalue(0, max_data_id + 1)

            print("Inserting values:")
            print("Data ID:", data_id.getvalue())
            print("Country ID:", country_id)
            print("Year:", year)
            print("GDP:", gdp)
            print("Inflation:", inflation)
            print("Unemployment:", unemployment)
            print("External Debt:", external_debt)
            print("Population:", population)
            print("-------------------------")

            cursor.execute(
                insert_statement,
                (data_id, country_id, year, gdp, inflation,
                 unemployment, external_debt, population)
            )

    connection.commit()
    print("Data inserted into the database successfully!")

except cx_Oracle.Error as error:
    print("Error occurred while inserting data into the database:", error)

finally:
    cursor.close()
    connection.close()
