#! /bin/python3
"""
import_csv_data.py will structure the data from a CBORD CSV dump
data output will be stored into memory, and then uploaded into MongoDB
Created by: Landon Sterk landonsterk@gmail.com
Last Edited: May 10, 2017
"""
import os
from datetime import datetime as dt
from pprint import pprint
from pymongo import MongoClient
filepath = "/home/kiosk/Downloads/fulldata_05021517.csv"
# figure out when the file was modified (i.e. how old the data is)
editTime = dt.fromtimestamp(os.path.getmtime(filepath))
print("Edited time:", editTime)
data = {}


def generate_empty_user(userID):
    user = {
    "lastName" : "",
    "mealPlan" : {
        "max" : 0,
        "isWeekly" : False,
        "count" : 0,
        'planName' : "None"
    },
    "bonusBucks" : 0,
    "uName" : "",
    "firstName" : "",
    "uID" : userID,
    "updated" : dt.now(),
    "isLiveData" : False,
    "name" : ","
    }
    return user


def find_max_meals(meal_plan_name):
    """
    scan through a name of a plan to figure out how many meals it gets
    basically, find the longest series of characters that can be read as an int
    note that CD-100 gets read as 100, not -100
    """
    maxx = 0
    idx = 0
    searching = True
    while searching:
        try:
            # this will generate a ValueError if can't read current char as int
            maxx = int(meal_plan_name[idx])
            # if executing here, then the current base position is a valid int
            length = 1
            while True:
                # keep trying for longer and longer numbers
                length += 1
                try:
                    tmp = int(meal_plan_name[idx:idx+length])
                    # best to make a temp variable, else it messes up assignment
                    maxx = tmp
                except ValueError:
                    # have gone past the last valid number character
                    return maxx
                except IndexError:
                    # must have run off the end of the line
                    # unexpected, but still have a valid number, so return it
                    return maxx
        except ValueError:
            # current character isn't valid as an int, so try the next one
            idx += 1
        except IndexError as ie:
            # somehow didn't find anything that could be read as a number
            # SHOULD NOT get to this point though
            print(ie)
            maxx = "?"
    # shouldn't ever reach this line, but why not include it
    return maxx

# open the output CSV file and read it line by line
with open(filepath, 'r') as f:
    for line in f:
        # breakup the CSV by field after removing any whitespace on ends
        parts = line.strip().split(',')
        # shouldn't have fewer than 7 parts, but will cause a headache if you do
        if len(parts) != 7:
            print("Skipping line", parts)
            continue
        # concurrent assignment. Note that each variable is a String right now
        uID, email, planName, dataType, count, firstName, lastName = [x.strip() for x in parts]
        while len(uID) < 7:
            # CBORD database output trims leading 0's
            # need to have 7 digit ID's
            uID = "0" + uID
        if uID not in data:
            data[uID] = generate_empty_user(uID)
        # extract username from email address
        data[uID]['uName'] = email.split('@')[0]
        data[uID]['lastName'] = lastName
        data[uID]['firstName'] = firstName
        # kinda redundant, but our database schema calls for it
        data[uID]['name'] = lastName + ',' + firstName
        if dataType == 'Board':
            # describing meal plan, not bonus bucks
            if 'Default' in planName:
                # data[uID]['mealPlan'] = {
                # 'planName' : planName
                # 'count' : 0,
                # 'isWeekly' : False,
                # "max" : 0
                # }
                print("No meal plan for", name)
            else:
                data[uID]['mealPlan'] = {
                'count' : int(count),
                'isWeekly' : "week" in planName or "Any" in planName,
                'max' : find_max_meals(planName),
                'planName' : planName
                }
                # done processing Board
        # if not Board, probably Bonus Bucks
        elif dataType == 'Bonus Bucks':
            data[uID]['bonusBucks'] = float(count)
        # editTime is when the file was most recently updated
        data[uID]['updated'] = editTime
        # currently set to false because not getting live data :'(
        data[uID]['isLiveData'] = False

# pprint(data)

print("Finished reading values, connecting to mongoDB now")
# some connection to the database
client = MongoClient('mongodb://localhost:27017/')
# kiosk database, records collection
coll = client['kiosk']['records']

#bulk operations go faster
bulk = coll.initialize_unordered_bulk_op()
for uID, record in data.items():
    # will replace a document with the same uID
    # note that this assumes that all data on user that we want is in the dump
    # if a doc only has BonusBucks data, it'll set meals to 0 for the users in the doc
    # this would probably be good to change to $set instead of replace_one
    bulk.find({'uID' : uID}).upsert().replace_one(record)

result = bulk.execute()
try:
    # upserted is a huge long list of documents and ObjectIds, better to delete it
    result.pop('upserted')
except:
    # didn't trim out the long list of inserted/upserted documents
    pass
pprint(result)
