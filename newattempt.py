import requests
import cx_Oracle

# Set the details for your Oracle database
dsn_tns = cx_Oracle.makedsn('MLaptop', '1521', service_name='xe')
conn = cx_Oracle.connect(user='system', password='tiger', dsn=dsn_tns)

# Set up a cursor
cursor = conn.cursor()

# Fetch country data from World Bank API
response = requests.get(
    "http://api.worldbank.org/v2/country?format=json&per_page=300")
countries = response.json()[1]

for country in countries:
    # Extract data from API response
    countryId = country["iso2Code"]
    name = country["name"]
    continent = country["region"]["value"]
    capital = country.get("capitalCity", "")

    # Fetch language data from Restcountries API
    language_response = requests.get(
        f"https://restcountries.com/v3.1/alpha/{countryId}")
    language_data = language_response.json()[0]
    # Assume languages is a dict where keys are language codes and values are language names
    languages = ', '.join(language_data['languages'].values())

    # Insert data into Countries table
    cursor.execute("""
        INSERT INTO Countries (countryId, name, continent, capital, languages)
        VALUES (:countryId, :name, :continent, :capital, :languages)
    """, countryId=countryId, name=name, continent=continent, capital=capital, languages=languages)

for country in countries:
    countryId = country["iso2Code"]
    # Fetching GDP, inflation, unemployment for a specific year (2021 in this case)
    codes = ["NY.GDP.MKTP.CD", "FP.CPI.TOTL.ZG", "SL.UEM.TOTL.ZS", "DT.DOD.DECT.CD", "SP.POP.TOTL"]
    data = {}

    for code in codes:
        response = requests.get(
            f"http://api.worldbank.org/v2/country/{countryId}/indicator/{code}?date=2021&format=json")
        indicators = response.json()[1]

        if indicators is not None and len(indicators) > 0:
            data[code] = indicators[0]["value"]

    # Generate a unique ID for dataId.
    dataId = countryId + str(2021)


    # Insert data into EconomicData table
    cursor.execute("""
        INSERT INTO EconomicData (dataId, countryId, year, GDP, inflation, unemployment, externalDebt, population)
        VALUES (:dataId, :countryId, :year, :GDP, :inflation, :unemployment, :externalDebt, :population)
    """, dataId=dataId, countryId=countryId, year=2021, GDP=data.get("NY.GDP.MKTP.CD"), inflation=data.get("FP.CPI.TOTL.ZG"), unemployment=data.get("SL.UEM.TOTL.ZS"), externalDebt=data.get("DT.DOD.DECT.CD"), population=data.get("SP.POP.TOTL"))

    conn.commit() #commit the transaction
