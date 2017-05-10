#! /usr/bin/python3
# MUST RUN THIS SCRIPT WITH ROOT PRIVILEGES
# MagTek reader can only be read by users with root access
# builds off of depencies for reading MagTek data

# sudo pip3 install pyusb
# git clone https://github.com/jdreed/python-magtek/
# sudo pip3 install ./python-magtek

"""
cardreader.py
Created by: Landon Sterk
Last Updatd: May 10, 2017

TODO: add verification that a card being swiped is actually a Calvin ID card
e.g. it has the super special code and format
"""
from magtek import MagTek
from time import sleep
import traceback

# controller that accesses all of the mag stripe data
m = MagTek()
data = False
#print("Polling the card reader...")
print("Beginning the endless loop of reading")
output_path = "/var/log/kiosk/card.log"
while True :
    # endless loop of polling the card reader
    try:
        data = m.readCard()
        # data for ISO standard (what Calvin uses) is all on Track 2
        # card number data is binary encoded in positions 7 to end
        # last two digits are the issue number, so just chop those off
        # also need to read it as an ascii because who doesn't like strings?
        user_id = data.getTrack(2)[7:-3].decode('ascii')
        # note that credit cards, other data will be WAY too long
        print("Welcome,", user_id)
        with open(output_path, 'a') as out:
            # append user_id to the file
            print(user_id, file=out)

    except AttributeError:
        # no card data found
        pass
    except KeyboardInterrupt as k:
        # user is trying to escape using Ctrl + C or equivalent
        print("Exiting application")
        break
        # raise k
    except Exception as e:
        print(e)
        traceback.print_exc()
