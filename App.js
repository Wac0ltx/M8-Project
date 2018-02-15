import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View, ActivityIndicator, ListView } from 'react-native';
import moment from 'moment';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        text: ''};
  }

  
 /* place(){
    if (lahtopaikka.toUpperCase = "PASILA") {
      lahto = "PSL";
      saapumis = "PSL";
      var url = lahto + "/" + saapumis + "?limit=15'";
      "PASILA" = "PSL";
    }
    if (lahtopaikka.toUpperCase = "HELSINKI"){
      var url = "HKI/HKI?limit=15";
      "HELSINKI" = "HKI"
    }
  }*/
    
    componentDidMount() {
    return fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/PSL/HKI?limit=15')
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson), 
        }, function() {
          // do something with new state
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  formatDate(date){
    return moment(date).format("hh:mm")
  }

  trains(){
    dataSource=this.state.dataSource;
    renderRow=(rowData) => {
      const hello = "hello";
      return hello;
      if (rowData.commuterLineID.length){}
  }
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
            <TextInput ref={'lahtopaikka'} style={styles.textinput}
              placeholder="Lähtöpaikka"
            />
            <Text style={styles.text}></Text>
           <TextInput ref={'paateasema'} style={styles.textinput}
              placeholder="Pääteasema/Junan numero"
            />
            </View>
            <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) =>

                <Text numberOfLines={1}>Juna: {rowData.commuterLineID}&emsp;
                Saapuu: {this.formatDate(rowData.timeTableRows[1].scheduledTime)}&emsp;
                {rowData.timeTableRows[rowData.timeTableRows.length-1].stationShortCode}:&nbsp;
                {this.formatDate(rowData.timeTableRows[rowData.timeTableRows.length-1].scheduledTime)}
                </Text>
            }
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
      row: { height: 30 }
});

// skip this line if using Create React Native App
//AppRegistry.registerComponent('AwesomeProject', () => UselessTextInput);
