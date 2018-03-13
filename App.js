import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View, ActivityIndicator, ListView } from 'react-native';
import moment from 'moment';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        text: '',
        lahtopaikka: 'HKI',
        saapumispaikka: ''};
  }

    componentDidMount() {
        let lahto =  this.state.lahtopaikka;
        let saapumis = "";
      if (lahto.toUpperCase() == "PASILA"){
        lahto = "PSL"
      }else if (lahto.toUpperCase() == "LEPPÄVAARA"){
        lahto = "LPV"
      }else if (lahto.toUpperCase() == "TURKU" || lahto.toUpperCase == "TURKU ASEMA"){
        lahto = "TKU"
      }else if (lahto.toUpperCase() == "KIRKKONUMMI"){
        lahto = "KKN"
      }else if (lahto.toUpperCase() == "HYVINKÄÄ"){
        lahto = "HY"
      }else if (lahto.toUpperCase() == "TAMPERE"){
        lahto = "TPE"
      }else if (lahto.toUpperCase() == "TURKU SATAMA"){
        lahto = "TUS"
      }else if (lahto.toUpperCase() == "ESPOO"){
         lahto = "EPO"
      }else {
        lahto = "HKI"
      };
    return fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + lahto + saapumis)
      .then((response) => response.json())
      .then((responseJson) => {
        
        console.log(responseJson.length)
        
        var trainNo = "";
        var arrivalStation = "";
        var arrivalTime = "";
        for (var i = 0; i < responseJson.length; i++){
            
            if (responseJson[i].commuterLineID !== ""){
                trainNo = responseJson[i].commuterLineID
            }else {
                trainNo = responseJson[i].trainNumber
            }
            responseJson[i].trainID = trainNo
            
                for (i2 = 0; i2 < responseJson[i].timeTableRows.length; i2++){
                    if (responseJson[i].timeTableRows[i2].stationShortCode === lahto
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
            console.log("Length: " + responseJson[i].commuterLineID.length + " LahtoAika: " + this.formatDate(departureTime) + " PaateAsema: " + arrivalStation + " PaateAika: " + this.formatDate(arrivalTime))
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
    return moment.utc(date).add(2, "hours").format("HH:mm")
  }

lahtoChanged = (lahto) => {
  console.log(lahto)
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
                
                        {console.log("PuhNumero: " + rowData.trainID + " PuhLahto: " + this.formatDate(rowData.departureTime) + " PuhSPaikka: " + rowData.arrivalStation + " PuhSAika: " + this.formatDate(rowData.arrivalTime))}
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
