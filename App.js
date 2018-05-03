import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View, ActivityIndicator, ListView } from 'react-native';
import moment from 'moment';
import {geolocated} from 'react-geolocated';
import geolib from 'geolib';
import 'mt-latlon';

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
      };
  }

    componentDidMount() {
      let stationName = '';
      let stationShort = 'HKI';
      var geolocation = null;
      
      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then((responseJson) => {

        for (var i3 = 0; i3 < responseJson.length; i3++){
          if (responseJson[i3].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: responseJson[i3].stationShortCode});
            stationShort = this.state.stationShort;
          }else if (responseJson[i3].stationName.toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: responseJson[i3].stationShortCode});
          }

          if (responseJson[i3].stationName.split(' asema')[0].toUpperCase() === this.state.saapumispaikka.toUpperCase()){
            this.setState({stationShort: responseJson[i3].stationShortCode});
            stationShort2 = this.state.stationShort2;
          }else if (responseJson[i3].stationName.toUpperCase() === this.state.saapumispaikka.toUpperCase()){
            this.setState({stationShort2: responseJson[i3].stationShortCode});
          }

          if (responseJson[i3].stationShortCode === this.state.stationShort){
            if (responseJson[i3].passengerTraffic !== false){
              stationName = responseJson[i3].stationName.split(' asema')[0];
            }
          }

          var stationLocations = responseJson.filter(function (el) {
            return el.passengerTraffic === true
          });
        }

        var nearestStop = "";
        var distance = "";
        if (window.navigator && window.navigator.geolocation) {
          geolocation = window.navigator.geolocation;
        }
        if (geolocation) {
          geolocation.getCurrentPosition(function(position) {
            console.log("blabla");
            distance = geolib.orderByDistance({latitude: position.coords.latitude, longitude: position.coords.longitude},
              stationLocations
            );
            nearestStop = stationLocations[distance[0].key].stationShortCode;
            console.log(nearestStop);
            
            this.setState({stationShort: stationLocations[distance[0].key].stationShortCode});
          });
          console.log("fuck " + distance);
        }else {
          console.log("geolocation not working");
        };

        console.log("you " + nearestStop);
        console.log(this.state.stationShort);
        stationShort = this.state.stationShort;
    fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + this.state.stationShort + "/" + this.state.stationShort2 + '?departing_trains=16&departed_trains=0&arrived_trains=0&arriving_trains=0')
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

          responseJson2[i].lastStop = arrivalsStation;
          responseJson2[i].lastTime = this.formatDate(arrivalsTime[0]);
          responseJson2[i].departingTime = this.formatDate(departures[0]);
        }
        
        for (let i = 0; i < visibleTrains.length; i++){
          responseJson2[i].visibleTrains = visibleTrains[i];
        }

        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson2),
          json: responseJson2
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
  this.setState({saapumispaikka: saapumis}, () => this.componentDidMount() );
}

  render() {
          if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }  

    return (
          <View style={{flex: 1, paddingTop: 20}}>
            <View style={styles.container}>
            <View>
              <TextInput
                style={styles.textinput}
                placeholder="Lähtöpaikka"
                onChangeText={this.lahtoChanged}
              />
              <TextInput
                style={styles.textinput}
                placeholder="Pääteasema"
                onChangeText={this.saapumisChanged}
              />
            </View>
              
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.junatext}>Juna</Text>
                <Text style={styles.junatext1}>Lähtee</Text>
                <Text style={styles.junatext1}>Pääteasema</Text>
                <Text style={styles.junatext1}>Saapuu</Text>
            </View>
            <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) =>
                <View numberOfLines={1} style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Text style={styles.junatext2}>{rowData.visibleTrains}&emsp;</Text>
                    <Text style={styles.junatext3}>{rowData.departingTime}</Text>
                    <Text style={styles.junatext4}>{rowData.lastStop}</Text>
                    <Text style={styles.junatext5}>{rowData.lastTime}</Text>
            </View>
            }
            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator}/>}
            />
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
    },
    container1: {
        borderWidth: 1,
        padding: 10,
    },
    container2: {
        borderWidth: 1,
        padding: 20,
    },
    textinput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 15,
        padding: 5,
        fontSize: 25,
    },
    text: {
        padding: 10,
    },
      head: { height: 40, backgroundColor: '#f1f8ff' },
      text2: { marginLeft: 5 },
      row: { height: 30 },
    junatext:{
      marginLeft:15,
      marginBottom:10,
      marginTop:10,
      fontSize:18
    },
    junatext1:{
      marginLeft:20,
      marginTop:10,
      fontSize:18
    },
    junatext2:{
        marginLeft:25,
        fontSize:16,
    },
    junatext3:{
      position: 'absolute',
      left:80,
      fontSize:16
    },
     junatext4:{
        marginLeft:185,
        position: 'absolute',
        fontSize:16
    },
    junatext5:{
        marginLeft:15,
        position:'absolute',
        fontSize:16,
        right:44
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
});
