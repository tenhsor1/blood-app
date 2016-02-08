# BloodApp — Geospatial Project
BloodApp is a platform that allow to connect blood donors with patients.

###Requirements:
* Development
    * nodejs=^0.10.25
    * mongodb=^3.0.3
* Testing
    * mocha-cli=^2.4.5
    * karma-cli=^0.12.37
* Optional
    * npm=^3.3.8
    * bower=^1.6.5

###Download:
` git clone https://github.com/tenhsor1/blood-app `

###Installation (Ubuntu 14.04):
* requirements:
    * Node.js

    ` apt-get install nodejs `
    * MongoDB

    ` apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 `

    ` echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list `

    ` apt-get update `

    ` apt-get install -y mongodb-org `
    * NPM

    ` apt-get install npm `

    ` npm install -g npm stable `
    * Test tools

    ` npm install -g mocha `

    ` npm install -g bower `

* packages:

    ` cd /path/cloned/project/blood-app `

    ` npm install `

###Deployment:
` cd /path/cloned/project/blood-app `

` node server.js -p 8000 `

or if you use forever:
` forever -a start server.js -p 8000 `

###Unit Testing:
` cd /path/cloned/project/blood-app `

` mocha `

How it works:
Access from a modern browser (ie 9+) to: http://localhost:8000

There are two columns on the page displayed:
  On the right one, there is a map that shows markers for the blood donors registered, in the zone been viewed
    (The browser will ask you for permission to share with us your current location, if you accept, the map will be centered to your current location)
  On the left one, there is a list with the same donors been displayed in the map

You can move through the map, and it will refresh the markers with the donors inside the bounds of the current view.
The donors list on the left will be refreshed at the same time as the map.

In the map, clicking on the marker wil display a popup that shows donor's details.

Clicking on the map (wherever there isn't a marker) will create a blue marker.
  Clicking again on this blue marker will display a form that allow you to register as a donor.
  If you complete all the fields correctly, and submit the form, you'll see a success message, and a hyperlink.
    Clicking on the hyperlink will open a new tab, where you can edit your donor information, or even delete your donor account :(
  Now your donor information will be displayed on the map to.
  You can delete or edit your account whenever you want using the link provided previously.