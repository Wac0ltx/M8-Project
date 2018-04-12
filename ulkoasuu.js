import React, { Component } from 'react';
import {
  StyleSheet,
  AppRegistry,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ListView,
  SectionList,
  Alert,
  FlatList,
  MyItem,
} from 'react-native';
import moment from 'moment';
import{ List, ListItem } from 'react-native-elements';

class JunaApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      trains: [],
       text: '',
      lahtopaikka: 'helsinki',
      saapumispaikka: '',
      stationShort: 'HKI',
      meta: '',
      refreshing: false,
    };
  }

      componentDidMount() {

      let stationName = '';
      let stationShort = 'HKI';
      let meta = this.state.meta;
      

      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({meta: responseJson});

        for (var i3 = 0; i3 < meta.length; i3++){
          if (meta[i3].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase() && meta[i3].stationName !== "Helsinki Kivihaka"){
            this.setState({stationShort: meta[i3].stationShortCode})
          }else if (meta[i3].stationName.toUpperCase() === this.state.lahtopaikka.toUpperCase()){
            this.setState({stationShort: meta[i3].stationShortCode})
          }else if (responseJson[i3].stationName === "Helsinki Kivihaka"){
            stationShort = "KHK";
          }else {
            stationShort = "ERROR";
          }
          if (meta[i3].stationShortCode === this.state.stationShort){
            if (meta[i3].stationName !== "Helsinki Kivihaka"){
              stationName = meta[i3].stationName.split(' asema')[0]
            }
          }
        }
    

    const url = 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + this.state.stationShort;
   fetch(url)
      .then(response2 => response2.json())
      .then(responseJson2 => {
         
        let d = new Date();
        let currentHours = d.getHours();
        let currentMins = d.getMinutes();
        let trainNo = "";
        let arrivalStation = "";
        let arrivalTime = "";
        let departureTime = "";
        let trainNum = "";
        
        for (var i = 0; i < responseJson2.length; i++){
          
          if (responseJson2[i].commuterLineID !== ""
            && responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
            || responseJson2[i].commuterLineID === "P"
            || responseJson2[i].commuterLineID === "I"){
              trainNo = responseJson2[i].commuterLineID
          }else if (responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort){
            trainNo = responseJson2[i].trainNumber
          }else {trainNo = undefined}
        
          for (var i2 = 0; i2 < responseJson2[i].timeTableRows.length; i2++){

            if (responseJson2[i].timeTableRows[i2].stationShortCode === stationShort
              && responseJson2[i].timeTableRows[i2].type === "DEPARTURE"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(d)
              && responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
              && responseJson2[i].timeTableRows[i2].scheduledTime !== responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime) {
                departureTime = responseJson2[i].timeTableRows[i2].scheduledTime;
                //console.log(trainNo + " " + departureTime + " " + this.formatDate(departureTime));
            }else if (responseJson2[i].timeTableRows[i2].stationShortCode === stationShort
              && responseJson2[i].timeTableRows[i2].type === "DEPARTURE"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(d)
              && responseJson2[i].timeTableRows[i2].scheduledTime !== responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
              && responseJson[i].commuterLineID === "P"
              || responseJson2[i].commuterLineID === "I"){
                departureTime = responseJson2[i].timeTableRows[i2].scheduledTime;
                //console.log(trainNo + " " + departureTime + " " + this.formatDate(departureTime));
            }else {departureTime == undefined}

            if (responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode !== stationShort
              && responseJson2[i].timeTableRows[i2].type === "ARRIVAL"
              && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isAfter(departureTime)){
                arrivalStation = responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].stationShortCode
                arrivalTime = responseJson2[i].timeTableRows[responseJson2[i].timeTableRows.length-1].scheduledTime
            }else if (responseJson2[i].timeTableRows[i2].stationShortCode === "LEN"
            && responseJson2[i].timeTableRows[i2].type === "ARRIVAL"
            && moment(responseJson2[i].timeTableRows[i2].scheduledTime).isSameOrAfter(departureTime)
            && responseJson2[i].commuterLineID === "P" 
            || responseJson2.commuterLineID === "I"){
              arrivalStation = responseJson2[i].timeTableRows[i2].stationShortCode
              arrivalTime = responseJson2[i].timeTableRows[i2].scheduledTime
              //console.log(trainNo + " " + arrivalStation + " " + arrivalTime);
            }else {
              arrivalStation == null;
              arrivalTime == null;
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
              responseJson2[i].arrivalStation = arrivalStation;
              responseJson2[i].arrivalTime = arrivalTime;
          }else {
            responseJson2[i].arrivalStation = "Error";
            responseJson2[i].arrivalTime = "Error";
          }

          responseJson2[i].allData = trainNo + " " + this.formatDate(departureTime) + " " + this.formatDate(arrivalTime) + " " + arrivalStation;
        }

        this.setState({
          trains: responseJson2,
          refreshing: false
        });
      });
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
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }
  
    const sorted = this.state.trains.sort(function(a,b){
     return a.departureTime > b.departureTime ? 1 : a.departureTime < b.departureTime ? -1 : 0;
    });
    const sliced = sorted.slice(0, 3);
    /*
      const itemRows = sliced.map(train => (
      <View key={train.trainNumber}>
        <Text style={styles.junatext2}>{train.trainID}&emsp;</Text>
        <Text style={styles.junatext3}>
          {this.formatDate(train.departureTime)}
        </Text>
        <Text style={styles.junatext4}>{train.arrivalStation}</Text>
        <Text style={styles.junatext5}>
          {this.formatDate(train.arrivalTime)}
        </Text>
      </View>
    ));
    */
    return (
      
      <View style={{ flex: 1, paddingTop: 20 }}>
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
              onChangeText={text => this.setState({ paateasema: text })}
            />
          </View>
      
        <List containerStyle={{marginBottom: 20}}>
  {
    sliced.map((l, i) => (
      <ListItem
        key={i} 
        rightTitle={l.trainNumber}
        title={l.commuterLineID}
        subtitleNumberOfLines={4}
        subtitle={this.formatDate(l.departureTime)}
        rightIcon={l.trainNumber}
      />
    ))
  }
</List>
        
      </View>
     </View>
     
    );
  }
}

export default JunaApp;

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
  junatext: {
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 10,
    fontSize: 18,
  },
  junatext1: {
    marginLeft: 20,
    marginTop: 10,
    fontSize: 18,
  },
  junatext2: {
    marginLeft: 25,
    fontSize: 16,
  },
  junatext3: {
    position: 'absolute',
    left: 80,
    fontSize: 16,
  },
  junatext4: {
    marginLeft: 185,
    position: 'absolute',
    fontSize: 16,
  },
  junatext5: {
    marginLeft: 15,
    position: 'absolute',
    fontSize: 16,
    right: 44,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});