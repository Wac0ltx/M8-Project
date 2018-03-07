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
        let lahto =  'HKI';
        let saapumis = "";
      if (this.state.lahtopaikka.toUpperCase() == "PASILA"){
        lahto = "PSL"
      }else {
        lahto = "HKI"
      };
      let stationName = '';
      let stationShort = 'HKI';
      fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({meta: responseJson});
      })
      console.log("ei fetch:" + this.state.stationShort)
      console.log("ei fetch:" + this.state.meta[0]);
    fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + this.state.stationShort + saapumis)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("toka fetch: " + this.state.stationShort)
        console.log("Live trains määrä:" + responseJson.length)
        
        var trainNo = "";
        var arrivalStation = "";
        var arrivalTime = "";
        let meta = this.state.meta
        for (var i3 = 0; i3 < meta.length; i3++){
          if (meta[i3].stationName.split(' asema')[0].toUpperCase() === this.state.lahtopaikka.toUpperCase() && meta[i3].stationName !== "Helsinki Kivihaka"){
            this.setState({stationShort: meta[i3].stationShortCode})
            console.log("jee: " + meta[i3].stationShortCode)
          }/*else if (responseJson[i3].stationName === "Helsinki Kivihaka"){
            stationShort = "KHK";
          }else {
            stationShort = "ERROR";
          }*/
          if (meta[i3].stationShortCode === this.state.stationShort){
            if (meta[i3].stationName !== "Helsinki Kivihaka"){
              stationName = meta[i3].stationName.split(' asema')[0]
            }
            console.log("meidän pysäkki: " + stationName)
          }
        }
        
        for (var i = 0; i < responseJson.length; i++){
            
            if (responseJson[i].commuterLineID !== ""){
                trainNo = responseJson[i].commuterLineID
            }else {
                trainNo = responseJson[i].trainNumber
            }
            responseJson[i].trainID = trainNo
            
                for (var i2 = 0; i2 < responseJson[i].timeTableRows.length; i2++){
                    if (responseJson[i].timeTableRows[i2].stationShortCode === stationShort
                       && responseJson[i].timeTableRows[i2].type === "DEPARTURE") {
                    var departureTime = responseJson[i].timeTableRows[i2].scheduledTime
                    responseJson[i].departureTime = departureTime
                   }
/*                 if (responseJson[i].commuterLineID === "P" ||   responseJson[i].commuterLineID === "I"){
                        if (responseJson[i].timeTableRows[i2].stationShortCode === "LEN"){
*/
                            arrivalStation = responseJson[i].timeTableRows[i2].stationShortCode
                            responseJson[i].arrivalStation = arrivalStation
/*                            if (responseJson[i].timeTableRows[i2].type === "ARRIVAL"){
*/
                                arrivalTime = responseJson[i].timeTableRows[i2].scheduledTime
                                responseJson[i].arrivalTime = arrivalTime
/*                            }
                        }
                    }else { 
*/
                        arrivalStation = responseJson[i].timeTableRows[responseJson[i].timeTableRows.length-1].stationShortCode
                        responseJson[i].arrivalStation = arrivalStation
                        arrivalTime = responseJson[i].timeTableRows[responseJson[i].timeTableRows.length-1].scheduledTime
                        responseJson[i].arrivalTime = arrivalTime
//                    }
                }
            // console.log("Length: " + responseJson[i].commuterLineID.length + " LahtoAika: " + this.formatDate(departureTime) + " PaateAsema: " + arrivalStation + " PaateAika: " + this.formatDate(arrivalTime))
        }
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson),
          json: responseJson
        }, function() {
          
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  formatDate(date){
    return moment.utc(date).format("HH:mm")
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

// skip this line if using Create React Native App
//AppRegistry.registerComponent('AwesomeProject', () => UselessTextInput);
