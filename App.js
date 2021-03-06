import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View, ActivityIndicator, ListView } from 'react-native';
import moment from 'moment';
import geolib from 'geolib';
import {Location} from 'expo';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        text: '',
        lahtopaikka: '',
        saapumispaikka: '',
        stationShort: 'HKI',
        stationShort2: '',
        meta: '',
        timeUrl: '?departing_trains=8&departed_trains=0&arrived_trains=0&arriving_trains=0',
        kolmas: 'Pääteasema',
        trains:[],
      };
  }

    componentDidMount = async () => { 
      let stationName = '';
      let stationShort = 'HKI';
      let meta = this.state.meta;
      let timeUrl = this.state.timeUrl;
      let foo = new Date();
      let stationShort2 = '';
      var bar = foo.toISOString();
      var geolocation = null;

      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then(async (responseJson) => {
        this.setState({meta: responseJson});

        for (let i = 0; i < responseJson.length; i++){
          if (responseJson[i].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: responseJson[i].stationShortCode});
            stationShort = this.state.stationShort;
          }else if (responseJson[i].stationName.toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: responseJson[i].stationShortCode});
          }else {
            stationShort = "HKI";
          }

          if (responseJson[i].stationName.split(' asema')[0].toUpperCase() === this.state.saapumispaikka.toUpperCase()
              && responseJson[i].passengerTraffic == true){
            this.setState({stationShort2: responseJson[i].stationShortCode});
          }else if (responseJson[i].stationName.toUpperCase() === this.state.saapumispaikka.toUpperCase()){
            this.setState({stationShort2: responseJson[i].stationShortCode});
                stationShort2 = this.state.stationShort2;
          }else {
            stationShort2 = "";
          }

          if (responseJson[i].stationShortCode === this.state.stationShort){
            if (responseJson[i].passengerTraffic !== false){
	             stationName = responseJson[i].stationName.split(' asema')[0];
            }
          }
          
          var stationLocations = responseJson.filter(function (el) {
            return el.passengerTraffic === true
          });
        }

        let location = null;
        const { Location, Permissions } = Expo;
        let status = await Permissions.askAsync(Permissions.LOCATION);
        console.log(status.status);
        if (status.status === "granted"){
        location = await Location.getCurrentPositionAsync({});
        }else {
          alert("Location disabled");
        }
        
        var nearestStop = "";
        var distance = "";

        if (location && this.state.lahtopaikka === '' || this.state.lahtopaikka === null) {
            distance = geolib.orderByDistance({latitude: location.coords.latitude, longitude: location.coords.longitude},
              stationLocations
            );
            nearestStop = stationLocations[distance[0].key].stationShortCode;
            this.setState({stationShort: nearestStop})
        }else {
          console.log("Location not working");
        }
        console.log("nearest: " + nearestStop);
        
        if(this.state.stationShort2 !== ''){
            this.setState({timeUrl: '/'+this.state.stationShort2+'?startDate='+ bar +'&limit=8'})
          }else{
            this.setState({timeUrl:'?departing_trains=8&departed_trains=0&arrived_trains=0&arriving_trains=0', kolmas:'Pääteasema'});

          }
        stationShort2 = this.state.stationShort2;
        stationShort = this.state.stationShort;
    fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + this.state.stationShort + this.state.timeUrl)
      .then((response2) => response2.json())
      .then((responseJson2) => {

        let d = new Date();
        let currentHours = d.getHours();
        let currentMins = d.getMinutes();
        let trainNo = "";
        let arrivalStation = "";
        let arrivalTime = "";
        let departureTime = "";
        let trainNum = "";

        for (var i = 0; i < responseJson2.length; i++){

          
          var visibleTrains = responseJson2.filter(function (el){
            return el.trainNumber
                && el.trainCategory !== "Shunting"
                && el.timeTableRows.find(function (el){
                  return el.stationShortCode === stationShort 
                      && el.type === "DEPARTURE"
                })
          }).map(function(el) {
            if (el.commuterLineID !== ""){
              return el.commuterLineID
            }else {
              return el.trainNumber
            }
          });
          
          
      
          var arrivalsStation = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode
                && el.type === "ARRIVAL"
          }).map(function(el) {
            return el.stationShortCode
          });
        
          var arrivalsTime = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode
                && el.type === "ARRIVAL"
                && el.scheduledTime.length > 0;
          }).map(function(el) {
            return el.scheduledTime
          });
                      
            var departures = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === stationShort
                && el.type === "DEPARTURE"
          }).map(function (el) {
            return el.scheduledTime
          });
          if(stationShort2 !== ''){
          console.log(stationShort2);
          var arrivals = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === stationShort2
                && el.type === "ARRIVAL"
               
          }).map(function (el) {
            return el.scheduledTime
            
          });
          var raide = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === stationShort
                && el.type === "DEPARTURE"
          }).map(function(el) {
            return el.commercialTrack
          });

          }
          
         // responseJson2[i].lastStop = arrivalsStation;
          responseJson2[i].departingTime = departures[0];
          responseJson2[i].visibleTrains = visibleTrains[i];
          
          if(stationShort2 === ''){
          responseJson2[i].saapumisTime = this.formatDate(arrivalsTime[0]);

          var statLongName = [];

          for (let i2 = 0; i2 < responseJson.length; i2++){
            if (arrivalsStation[0] === responseJson[i2].stationShortCode){
              statLongName = responseJson[i2].stationName.split(' asema')[0];
            }
          }
          responseJson2[i].lastStop = statLongName;
          }else{
          responseJson2[i].saapumisTime = this.formatDate(arrivals[0]);
          responseJson2[i].lastStop = raide;
          this.setState({stationShort2:''});
          }


        }

        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson2),
          json: responseJson2,
          trains: responseJson2
        }, function() {
        });
      })
      })
      
      .catch((error) => {
        console.error(error);
      });
  }
  formatDate(date){
    let str = moment.utc(date).add(3, "hours").format("HH:mm");
    return str;
  }

lahtoChanged = (lahto) => {
  this.setState({lahtopaikka: lahto}, () => this.componentDidMount() );
}

saapumisChanged = (saapumis) => {
  this.setState({saapumispaikka: saapumis, kolmas: 'Lähtöraide'}, () => this.componentDidMount() );
  
}

  render() {
          if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }  
    function sortF(a,b){
      var dateA = new Date(a.departingTime).getTime();
      var dateB = new Date(b.departingTime).getTime();
      return dateA > dateB ? 1 : -1;
    }
    
    const itemRows = this.state.trains.sort(sortF).map(train => (
      <View key={train.trainNumber} style={styles.row1}>
        <Text style={styles.junatext2}>{train.visibleTrains}&emsp;</Text>
        <Text style={styles.junatext3}>{this.formatDate(train.departingTime)}</Text>
        <Text style={styles.junatext4}>{train.lastStop}</Text>
        <Text style={styles.junatext5}>{train.saapumisTime}</Text>
      </View>
));


    return (
         <View style={{flex: 1, paddingTop: 20}}>
            <View style={styles.container}>
            <View>
              <TextInput
                style={styles.textinput1}
                underlineColorAndroid='transparent'
                placeholder="lähtöpaikka"
                onChangeText={this.lahtoChanged}
              />
              <TextInput
                style={styles.textinput2}
                underlineColorAndroid='transparent'
                placeholder="pääteasema"
                onChangeText={this.saapumisChanged}
              />
            </View>
          <View style={styles.container1}>
           <View style={{ flexDirection: 'row' }}>
            <Text style={styles.junatext6}>Juna</Text>
            <Text style={styles.junatext6}>Lähtee</Text>
            <Text style={styles.junatext6}>{this.state.kolmas}</Text>
            <Text style={styles.junatext6}>Saapuu</Text>
          </View>
        {itemRows}
        </View>
      </View>
     </View>
     
    );
  }
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#89CFF0',
    flex: 1,
    borderWidth: 5,
    borderColor: '#4C516D',
  },
  container1: {
    flex: 1,
    marginTop: 5,
    backgroundColor: 'white',
    borderWidth: 6,
    borderColor: '#73C2FB',
    borderRadius: 6,
    marginHorizontal: 2,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  row1: {
    marginTop:30,
    borderBottomWidth: 0.5,
    borderColor: '#4C516D'
  },
  textinput1: {
    height: 45,
    borderWidth: 6,
    backgroundColor: 'white',
    borderColor: '#73C2FB',
    textAlign: 'center',
    fontSize: 25,
    textDecorationLine: 'none',
    borderBottomWidth: 2,
  },
  textinput2: {
    height: 48,
    borderWidth: 6,
    backgroundColor: 'white',
    borderColor: '#73C2FB',
    textAlign: 'center',
    fontSize: 25,
    textDecorationLine: 'none',
  },
  head: {
    height: 40, backgroundColor: '#f1f8ff'
  },
  text2: {
    marginLeft: 5
  },
  row: {
    height: 30
  },
  junatext: {
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 10,
    fontSize: 15,
  },
  junatext1: {
    marginLeft: 20,
    marginTop: 10,
    fontSize: 14,
  },
  junatext2: {
    marginLeft: 20,
     fontSize: 14,
  },
  junatext3: {
    position: 'absolute',
    left: 80,
    fontSize: 14,
  },
  junatext4: {
    marginLeft: 164,
    position: 'absolute',
   fontSize: 14,
  },
  junatext5: {
    marginLeft: 15,
    position: 'absolute',
    fontSize: 14,
    right:20 ,
  },
  
  junatext6: {
    marginLeft: 14,
    marginTop: 10,
    fontSize: 18,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
