const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_API_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports = {
    geocoder
}