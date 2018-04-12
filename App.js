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
        meta: '',
      };
  }

    componentDidMount() {
      let stationName = '';
      let stationShort = 'HKI';
      let meta = this.state.meta;

      //  geolib


      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({meta: responseJson});

        for (var i3 = 0; i3 < meta.length; i3++){
          if (meta[i3].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: meta[i3].stationShortCode});
            stationShort = this.state.stationShort;
          }else if (meta[i3].stationName.toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: meta[i3].stationShortCode});
          }else if (meta[i3].stationName.toUpperCase() === "HELSINKI " + this.state.lahtopaikka.toUpperCase()){
            //this.setState({stationShort: meta[i3].stationShortCode});
            //console.log(this.state.stationShort);
          }else {
            stationShort = "HKI";
          }
          if (meta[i3].stationShortCode === this.state.stationShort){
            if (meta[i3].stationName !== "Helsinki Kivihaka"){
              stationName = meta[i3].stationName.split(' asema')[0];
            }
          }
          /*responseJson[i3].stationNames = stationName;
          console.log(responseJson[i3].stationNames);*/
        }

        stationShort = this.state.stationShort;
    fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + this.state.stationShort)
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

          if (responseJson2[i].commuterLineID !== ""){
            var visibleTrains = responseJson2.filter(function (el){
              return el.trainNumber
                  && el.timeTableRows.find(function (el){
                    return el.stationShortCode === stationShort 
                        && moment(el.scheduledTime).isSameOrAfter(d)
                        && el.type === "DEPARTURE"
                  })
            }).map(function(el) {
              return el.commuterLineID
            });
          }
          
          
          var arrivalsStation = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === "LEN"
                && el.TYPE === "ARRIVAL"
          }).map(function(el) {
            return el.stationShortCode
                && el.scheduledTime
          });

          var departures = responseJson2[i].timeTableRows.filter(function (el) {
            return el.stationShortCode === stationShort
                && el.type === "DEPARTURE"
                && moment(el.scheduledTime).isSameOrAfter(d)
          }).map(function (el) {
            return el.scheduledTime
          });
          //console.log(departures);
          for (let i = 0; i < departures.length; i++){
            responseJson2.arrivalsStation = this.formatDate(departures[0]);
            console.log(responseJson2.arrivalsStation);
          }
        }
        console.log(visibleTrains);
        //console.log("arrivalsStation " + arrivalsStation.length);
        
        for (var i = 0; i < responseJson2.length; i++){

          if (responseJson2[i].commuterLineID !== ""
            && responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
            || responseJson2[i].commuterLineID === "P"
            || responseJson2[i].commuterLineID === "I"){
              trainNo = responseJson2[i].commuterLineID
          }else if (responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort){
            trainNo = responseJson2[i].trainNumber
          }else {
            trainNo = undefined;
          }
        
          for (var i2 = 0; i2 < responseJson2[i].timeTableRows.length; i2++){

            if (responseJson2[i].timeTableRows[i2].stationShortCode === stationShort
              && responseJson2[i].timeTableRows[i2].type === "DEPARTURE"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(d)
              && responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
              && responseJson2[i].timeTableRows[i2].scheduledTime !== responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime) {
                departureTime = responseJson2[i].timeTableRows[i2].scheduledTime;
            }else if (responseJson2[i].timeTableRows[i2].stationShortCode === stationShort
              && responseJson2[i].timeTableRows[i2].type === "DEPARTURE"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(d)
              && responseJson2[i].timeTableRows[i2].scheduledTime !== responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
              && responseJson2[i].commuterLineID === "P"){
                departureTime = responseJson2[i].timeTableRows[i2].scheduledTime;
            }else if (responseJson2[i].timeTableRows[i2].stationShortCode === stationShort
              && responseJson2[i].timeTableRows[i2].type === "DEPARTURE"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(d)
              && responseJson2[i].timeTableRows[i2].scheduledTime !== responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
              && responseJson2[i].commuterLineID === "I"){
                departureTime = responseJson2[i].timeTableRows[i2].scheduledTime;
            }

            if (responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
              && responseJson2[i].timeTableRows[i2].type === "ARRIVAL"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isAfter(departureTime)){
                for (i3 = 0; i3 < responseJson.length; i3++){
                  if(responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode === responseJson[i3].stationShortCode){
                    arrivalStation = responseJson[i3].stationName.split(' asema')[0];
                  }
                }
                arrivalTime = responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
              }else if (responseJson2[i].timeTableRows[i2].stationShortCode === "LEN"
              && responseJson2[i].timeTableRows[i2].type === "ARRIVAL"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isAfter(departureTime)
              && responseJson2[i].commuterLineID === "P"
              && i2 <= 36){
                for (i3 = 0; i3 < responseJson.length; i3++){
                  if(responseJson2[i].timeTableRows[i2].stationShortCode === responseJson[i3].stationShortCode){
                    arrivalStation = responseJson[i3].stationName.split(' asema')[0];
                  }
                }
                arrivalTime = responseJson2[i].timeTableRows[i2].scheduledTime
              }else if (responseJson2[i].timeTableRows[i2].stationShortCode === "LEN"
              && responseJson2[i].timeTableRows[i2].type === "ARRIVAL"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isAfter(departureTime)
              && responseJson2[i].commuterLineID === "I"
              && i2 <= 26){
                for (i3 = 0; i3 < responseJson.length; i3++){
                  if(responseJson2[i].timeTableRows[i2].stationShortCode === responseJson[i3].stationShortCode){
                    arrivalStation = responseJson[i3].stationName.split(' asema')[0];
                  }
                }
                arrivalTime = responseJson2[i].timeTableRows[i2].scheduledTime
              }else if (moment(responseJson2[i].timeTableRows[i2].scheduledTime).isAfter(departureTime)
              && responseJson2[i].commuterLineID !== "I"
              && responseJson2[i].commuterLineID !== "P"){
                arrivalStation = responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode
                for (i3 = 0; i3 < responseJson.length; i3++){
                  if(arrivalStation === responseJson[i3].stationShortCode){
                    arrivalStation = responseJson[i3].stationName.split(' asema')[0];
                  }
                }
                arrivalTime = responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
              }else {
                arrivalStation = "moi";
                arrivalTime = null;
              }
          }

          if (trainNo !== undefined){
            responseJson2[i].trainID = trainNo;
          }else {
            responseJson2[i].trainID = "Error";
          }

          if (departureTime !== undefined){
            responseJson2[i].departureTime = departureTime;
          }else {
            responseJson2[i].departureTime = "Error";
          }

          if (arrivalTime !== undefined
            && arrivalStation !== undefined){
              responseJson2[i].arrivalStation = arrivalStation
              responseJson2[i].arrivalTime = arrivalTime;
          }else {
            responseJson2[i].arrivalStation = "Error";
            responseJson2[i].arrivalTime = "Error";
          }

          //console.log("ID: " + trainNo + " lahto " + this.formatDate(departureTime) + " saapuu: " + arrivalStation + " " + this.formatDate(arrivalTime));
          
          responseJson2[i].allData = trainNo + " " + this.formatDate(departureTime) + " " + this.formatDate(arrivalTime) + " " + arrivalStation;
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
                onChangeText={(text) => this.setState({paateasema: text})}
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
                    <Text style={styles.junatext2}>{rowData.trainID}&emsp;</Text>
                    <Text style={styles.junatext3}>{this.formatDate(rowData.departureTime)}</Text>
                    <Text style={styles.junatext4}>{rowData.arrivalStation}</Text>
                    <Text style={styles.junatext5}>{this.formatDate(rowData.arrivalTime)}</Text>
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
