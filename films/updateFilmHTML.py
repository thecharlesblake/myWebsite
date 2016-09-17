import csv
import xml.etree.ElementTree as ET

header_names = ["Title", "Year", "Rated", "Released", "Runtime", "Genre", "Director", "Writer", "Actors", "Plot", "Language", "Country", "Awards", "Poster", "Metascore", "imdbRating", "imdbVotes", "imdbID", "Type", "tomatoMeter", "tomatoImage", "tomatoRating", "tomatoReviews", "tomatoFresh", "tomatoRotten ", "tomatoConsensus", "tomatoUserMeter", "tomatoUserRating", "tomatoUserReviews", "tomatoURL", "DVD", "BoxOffice", "Production", "Website", "View Order", "My Rating"]
ordered_header_names = ["View Order", "Title", "Director", "Year", "Released", "Runtime", "Genre", "Writer", "Actors", "Plot", "Rated", "Language", "Country", "Awards", "DVD", "BoxOffice", "Production", "imdbVotes", "imdbID", "Type", "tomatoMeter", "tomatoImage", "tomatoReviews", "tomatoFresh", "tomatoRotten ", "tomatoConsensus", "tomatoUserMeter", "tomatoUserRating", "tomatoUserReviews", "tomatoURL", "Website", "Poster", "Metascore", "imdbRating", "tomatoRating", "My Rating"]

tree = ET.parse('index.html')
root = tree.getroot()

csvin = open('film_info_large.csv', 'r')
rIn = csv.reader(csvin)

for table in root.iter('table') :
    if (table.get('id') == "movie_table") :
        for child in table :
            table.remove(child)
        thead = ET.Element('thead')
        table.append(thead)
        tr = ET.Element('tr')
        thead.append(tr)
        for header in ordered_header_names :
            th = ET.Element('th')
            th.text = header
            tr.append(th)
        tbody = ET.Element('tbody')
        table.append(tbody)
        try :
            next(rIn)
            while (True) :
                row_data = next(rIn)
                tr = ET.Element('tr')
                tbody.append(tr)

                # goes through the ordered headers and gets the
                # index in the unordered headers which corresponds.
                # Then gets that object from the row in the csv
                for ohn in ordered_header_names :
                    datum = row_data[header_names.index(ohn)]
                    td = ET.Element('td')
                    td.text = datum
                    tr.append(td)
        except StopIteration :
            pass


tree.write('test.html', method="html")
