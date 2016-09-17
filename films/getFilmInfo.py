import csv, requests, json

headers = ["Title", "Year", "Rated", "Released", "Runtime", "Genre", "Director", "Writer", "Actors", "Plot", "Language", "Country", "Awards", "Poster", "Metascore", "imdbRating", "imdbVotes", "imdbID", "Type", "tomatoMeter", "tomatoImage", "tomatoRating", "tomatoReviews", "tomatoFresh", "tomatoRotten", "tomatoConsensus", "tomatoUserMeter", "tomatoUserRating", "tomatoUserReviews", "tomatoURL", "DVD", "BoxOffice", "Production", "Website"]

csvin = open('film_info_small.csv', 'r')
csvout = open('film_info_large.csv', 'r')

# Goes through each line of the files. When the large file no longer
# has data for the small one, create a list containing the movies (and
# ratings) which we still need to get data for.
rIn = csv.reader(csvin)
rOut = csv.reader(csvout)
newRows = []
next(rOut) # skips header

iFilm = None
try :
    while (True):
        iFilm = next(rIn)
        oFilm = next(rOut)
except StopIteration :
    newRows.append(iFilm)
    
try:
    while (True) :
        newRows.append(next(rIn))
except StopIteration :
    pass
print ("Getting info for the following films: " + str(newRows))

csvin.close()
csvout.close()

# Takes each film name in newRows and makes an
# API request for it. Writes the response fields,
# plus my rating, to the new csv

csvout = open('film_info_large.csv', 'a')
writer = csv.writer(csvout)

count = 1
for row in newRows:
    p = {'t' : row[0], 'type' : 'movie', 'tomatoes' : 'true'}
    if (len(row) == 3) :
        p['y'] = row[2]
    print ("Sending request for: " + row[0])
    r = requests.get('http://www.omdbapi.com', params=p)
    responseObj = json.loads(r.text)
    if (responseObj['Response'] == 'False') :
        print ("Error: could not find movie!")
        break
    for h in headers :
        csvout.write('"' + responseObj[h].replace("\"", "\'") + '",')
    csvout.write(str(count) + ",")
    csvout.write(row[1])
    csvout.write('\n')
    count += 1

csvout.close()
