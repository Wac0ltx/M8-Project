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
        saapumispaikka: '',
        i: 0,
        hello: '',
        json: ''};
  }

    componentDidMount() {
      let lahto =  this.state.lahtopaikka;
      if (this.state.lahtopaikka.toUpperCase() == "PASILA"){
        lahto = "PSL"
      }else {
        lahto = "HKI"
      };
    return fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + lahto)
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson),
          json: responseJson
        }, function() {
          // do something with new state
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  formatDate(date){
    return moment.utc(date).format("hh:mm")
  }

lahtoChanged = (lahto) => {
  console.log(lahto)
  this.setState({lahtopaikka: lahto}, () => this.componentDidMount() );
}

trains(){
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
          <Text>Test {this.trains()}</Text>
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

            <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) =>

             /* if (this.state.lahtopaikka = "PASILA"){
                this.state.i = 1
              }
                if (rowData.commuterLineID != null || rowData.commuterLineID != ''){
                  rowData.commuterLineID
                }
              */
                <Text numberOfLines={1}>Juna: {rowData.commuterLineID}&emsp;
                Lähtee: {this.formatDate(rowData.timeTableRows[0].scheduledTime)}&emsp;
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
