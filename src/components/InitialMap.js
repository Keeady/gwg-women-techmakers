import React, { Component } from 'react';
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';
import StaticMap from './StaticMap'
import Button from './RecenterMapButton'

const selectedIconUrl = 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png';
const defaultIconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
const markerIconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: this.props.searchTerm,
      places: this.props.places,
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},

    }

    // binding this to event-handler functions
    this.onMarkerClick = this.onMarkerClick.bind(this)
    this.onMarkerOver = this.onMarkerOver.bind(this)
    this.onMarkerOut = this.onMarkerOut.bind(this)
    this.onMapClicked = this.onMapClicked.bind(this);
    this.recenterMyMap = this.recenterMyMap.bind(this);
  }

  // change marker image to green on mouse over
  onMarkerOver = (props, marker, e) => {
    const { google } = this.props
    marker.setIcon({
      url: markerIconUrl,
      anchor: google.maps.Point(10, 10),
      scaledSize: google.maps.Size(10, 17)
    })
  }

  // change the marker image to red when mouse out
  onMarkerOut = (props, marker, e) => {
    const { google } = this.props
    marker.setIcon({
      url: defaultIconUrl,
      anchor: google.maps.Point(10, 10),
      scaledSize: google.maps.Size(10, 17)
    })
  }

  // show Infowindow when a marker is clicked and make it the active marker
  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }


  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  }

  onGoogleMapLoad = map => {
    this.map = map;
  }

  onMapReady = (mapProps, map) => {
    this.setState({ map });
    this.searchText(map, map.center, this.props.searchTerm)
  }

  searchText = (map, center, query) => {
    const { google } = this.props
    const service = new google.maps.places.PlacesService(map)
    const request = {
      location: center,
      radius: '500',
      query: query
    }

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        //console.log(results);

        this.setState({
          places: results,
        })

        //console.log("results= " + JSON.stringify(results))
        this.props.onLoad(results);
      }
    })

  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.map) return;
    if (nextProps.searchTerm && this.props.searchTerm !== nextProps.searchTerm) {
      this.setState({ searchTerm: nextProps.searchTerm })
      this.searchText(this.state.map, this.state.map.center, nextProps.searchTerm)
    }

    if (this.props.pos !== nextProps.pos) {
      this.searchText(this.state.map, nextProps.pos, this.props.searchTerm)
    }
  }

  componentWillMount(){

  }

 // recenter the map to User's current location
 recenterMyMap(){
  const {
    userPos
    } = this.props
  this.state.map.setCenter(userPos)
 }

  render() {
    //const google_api = process.env.REACT_APP_GKEY;
    let {pos} = this.props;

    const {
      places,
      google,
      mouseOverPlace,
      loaded
    } = this.props

    const {
      activeMarker,
      showingInfoWindow,
      selectedPlace
    } = this.state;

    //console.log("places : " + JSON.stringify(places))
    if (!loaded) {
      return <StaticMap pos={pos} />
    }

    // This code to fix issue#157  where map is only partially loading when current position value has not returned yet.
     if(!pos.lat) {
        //  pos.lat = 0.0;
        //  pos.lng = 0.0;

      return <div className="loadingIndicator" role="status" aria-live="polite" aria-label="Loading..."></div>
     }


    return (

      <div>

      <div className="theMap">

        <Map
          ref={this.onGoogleMapLoad}
          google={google}
          zoom={12}
          initialCenter={pos}
          center={pos}
          onReady={this.onMapReady}
          onClick={this.onMapClicked}
        >

        <Button
         onClick={this.recenterMyMap}
         >
         Recenter Map
          </Button>
          <Marker
            name={'Current Location'}
            title={'You are here'}
            position={pos}
            key={'001'}
            address={''}
            openNow={''}
            rating={5}
            priceLevel={''}
            reference={""}
            icon={{
              url: markerIconUrl,
              anchor: google.maps.Point(10, 10),
              scaledSize: google.maps.Size(10, 17)
            }}
          >
          </Marker>

          {
            places && places.map(p => {
              //console.log("p.Rating: " + p.rating);
              let isOpenNow = "";
              let priceLevel = "";
              let rating = "";

              const priceLevelDesc = {
                0: "Free",
                1: "Inexpensive",
                2: "Moderate",
                3: "Expensive",
                4: "Very Expensive"
              }

              if (p.opening_hour !== undefined) {
                isOpenNow = p.opening_hours.open_now ? 'OPEN NOW' : 'CLOSED'
              }

              if (p.rating !== undefined) {
                rating = p.rating
              }

              if (p.price_level !== undefined) {
                priceLevel = priceLevelDesc[p.price_level]
              }

              let iconUrl = defaultIconUrl;
              if (mouseOverPlace === p.id) {
                iconUrl = selectedIconUrl;
              }

              return (
                <Marker
                  key={p.id}
                  name={p.name}
                  address={p.formatted_address.replace(/,.*/g, "")}
                  openNow={isOpenNow}
                  rating={rating}
                  priceLevel={priceLevel}
                  reference={"" + p.place_id}
                  position={p.geometry.location}
                  //props.place.photos === undefined ?<img src={props.place.icon} alt= ""/> : <img src={props.place.photos[0].getUrl({'maxWidth': 135, 'maxHeight': 135})} alt="no image" />
                  photo={p.photos === undefined ? `` : p.photos[0].getUrl({ 'maxWidth': 100, 'maxHeight': 100 })}
                  icon={{
                    url: iconUrl,
                    anchor: google.maps.Point(10, 10),
                    scaledSize: google.maps.Size(10, 17)
                  }}
                  onClick={this.onMarkerClick}
                  onMouseover={this.onMarkerOver}
                  onMouseout={this.onMarkerOut} />
              )
            })
          }

          <InfoWindow
            marker={activeMarker}
            visible={showingInfoWindow}
          >
            <div id="info" style={{ backgroundColor: `yellow`, opacity: 0.75, }}>
              <div>
                <img src={selectedPlace.photo} alt="" />
              </div>
              <div>
                <div style={{ fontSize: `16px`, fontWeight: `bold`, fontColor: `#08233B` }}>
                  {selectedPlace.name}
                </div>
                <div>
                  Ratings :
                    <span style={{ fontWeight: `bold` }}>
                    {selectedPlace.rating
                      ? selectedPlace.rating
                      : ""
                    }
                  </span>

                  Price Level :
                    <span style={{ fontWeight: `bold` }}>
                    {selectedPlace.priceLevel}
                  </span>
                </div>
                <div> {selectedPlace.address}</div>
                <div>{selectedPlace.openNow} </div>
              </div>
            </div>
          </InfoWindow>
        </Map>
      </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: (process.env.REACT_APP_GKEY),
  libraries: ['places'],
  version: 3.31
})(MapContainer)
