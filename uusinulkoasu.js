import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View, ActivityIndicator, ListView } from 'react-native';
import moment from 'moment';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        text: '',
        lahtopaikka: 'helsinki',
        saapumispaikka: '',
        stationShort: 'HKI',
        stationShort2: '',
        meta: '',
        timeUrl: '?departing_trains=6&departed_trains=0&arrived_trains=0&arriving_trains=0',
        kolmas: 'Pääteasema',
        trains:[],
        test:''
      };
  }

    componentDidMount() { 
      let stationName = '';
      let stationShort = 'HKI';
      let meta = this.state.meta;
      let timeUrl = this.state.timeUrl;
      let foo = new Date();
      let stationShort2 = '';
      var bar = foo.toISOString();
    
      
      //  geolib


      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({meta: responseJson, test:bar});

        for (var i3 = 0; i3 < meta.length; i3++){
          if (meta[i3].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: meta[i3].stationShortCode});
            stationShort = this.state.stationShort;
          }else if (meta[i3].stationName.toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: meta[i3].stationShortCode});
          }else {
            stationShort = "HKI";
          }

          if (meta[i3].stationName.split(' asema')[0].toUpperCase() === this.state.saapumispaikka.toUpperCase()){
            this.setState({stationShort2: meta[i3].stationShortCode});
          }else if (meta[i3].stationName.toUpperCase() === this.state.saapumispaikka.toUpperCase()){
            this.setState({stationShort2: meta[i3].stationShortCode});
                stationShort2 = this.state.stationShort2;
          }else {
            stationShort2 = "";
          }

          if (meta[i3].stationShortCode === this.state.stationShort){
            if (meta[i3].stationName !== "Helsinki Kivihaka"){
              stationName = meta[i3].stationName.split(' asema')[0];
            }
          }
          
        }
        if(this.state.stationShort2 !== ''){
            this.setState({timeUrl: '/'+this.state.stationShort2+'?startDate='+ bar +'&limit=6'})
          }else{
            this.setState({timeUrl:'?departing_trains=6&departed_trains=0&arrived_trains=0&arriving_trains=0', kolmas:'Pääteasema'});

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
          responseJson2[i].lastStop = arrivalsStation;
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
                placeholder="Lähtöpaikka"
                onChangeText={this.lahtoChanged}
              />
              <TextInput
                style={styles.textinput2}
                placeholder="Pääteasema"
                onChangeText={this.saapumisChanged}
              />
            </View>
          <View style={styles.container1}>
           <View style={{ flexDirection: 'row' }}>
            <Text style={styles.junatext}>Juna</Text>
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
    paddingTop: 40,
    backgroundColor: '#d1e8ff',
    flex: 1
  },
  container1: {
    marginTop:30,
    backgroundColor: 'white',
    borderRadius:20,
    width:330,
    height: 450,
     marginLeft: 13,
     fontSize: 14,
  },
  container2: {
    borderWidth: 1,
    padding: 20,
  },
  row1: {
    marginTop:40,
    fontSize: 14,
  },
  textinput1: {
    height: 40,
    width:330,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    fontSize: 25,
    marginLeft: 13
  },
   textinput2: {
    height: 40,
    width:330,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    fontSize: 25,
    marginTop:10,
    marginLeft: 13
  },
  text: {
    padding: 10,
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text2: { marginLeft: 5 },
  row: { height: 30 },
  junatext: {
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 10,
    fontSize: 14,
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
    marginLeft: 180,
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
    marginLeft: 35,
    marginTop: 10,
    fontSize: 14,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
