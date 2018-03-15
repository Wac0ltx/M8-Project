import React, { Component } from 'react';
import {
  StyleSheet,
  AppRegistry,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ListView,
} from 'react-native';
import moment from 'moment';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      trains: [],
       text: '',
      lahtopaikka: 'HKI',
      saapumispaikka: ''
    };
  }

  componentDidMount() {
    var lahto = this.state.lahtopaikka.toUpperCase();
    /*var saapumis = "";*/
    if (lahto == 'PASILA') {
      lahto = 'PSL';
    } else if (lahto == 'LEPPÄVAARA') {
      lahto = 'LPV';
    } else {
      lahto = 'HKI';
    }
   return fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + lahto)
      .then(response => response.json())
      .then(responseData => {
        var trainNo = '';
        var arrivalStation = '';
        var arrivalTime = '';
        
        for (var i = 0; i < responseData.length; i++) {
          if (responseData[i].commuterLineID !== '') {
            trainNo = responseData[i].commuterLineID;
          } else if (responseData[i].trainType == 'IC') {
            trainNo =
              responseData[i].trainType + ' ' + responseData[i].trainNumber;
          } else if (responseData[i].trainType == 'S') {
            trainNo = 'Pendolino' + ' ' + responseData[i].trainNumber;
          } else if (responseData[i].trainType == 'PYO') {
            trainNo = 'Pikajuna' + ' ' + responseData[i].trainNumber;
          } else if (responseData[i].trainType == 'AE') {
            trainNo = 'Allegro' + ' ' + responseData[i].trainNumber;
          } else {
            trainNo = responseData[i].trainNumber;
          }
          responseData[i].trainID = trainNo;

          for (var i2 = 0; i2 < responseData[i].timeTableRows.length; i2++) {
            if (
              responseData[i].timeTableRows[i2].stationShortCode === lahto &&
              responseData[i].timeTableRows[i2].type === 'DEPARTURE'
            ) {
              var departureTime =
                responseData[i].timeTableRows[i2].scheduledTime;
              responseData[i].departureTime = departureTime;
            }
            /*                 if (responseJson[i].commuterLineID === "P" ||   responseJson[i].commuterLineID === "I"){
                        if (responseJson[i].timeTableRows[i2].stationShortCode === "LEN"){
*/
            arrivalStation = responseData[i].timeTableRows[i2].stationShortCode;
            responseData[i].arrivalStation = arrivalStation;
            /*                            if (responseJson[i].timeTableRows[i2].type === "ARRIVAL"){
*/
            arrivalTime = responseData[i].timeTableRows[i2].scheduledTime;
            responseData[i].arrivalTime = arrivalTime;
            /*                            }
                        }
                    }else { 
*/
            arrivalStation =
              responseData[i].timeTableRows[
                responseData[i].timeTableRows.length - 1
              ].stationShortCode;
            responseData[i].arrivalStation = arrivalStation;
            arrivalTime =
              responseData[i].timeTableRows[
                responseData[i].timeTableRows.length - 1
              ].scheduledTime;
            responseData[i].arrivalTime = arrivalTime;
            //                    }
          }
          console.log(
            'Length: ' +
              responseData[i].commuterLineID.length +
              ' LahtoAika: ' +
              this.formatDate(departureTime) +
              ' PaateAsema: ' +
              arrivalStation +
              ' PaateAika: ' +
              this.formatDate(arrivalTime)
          );
        }

        this.setState({
          isLoading: false,
          trains: responseData,
        });
      });
  }

  formatDate(date) {
    return moment.utc(date).add(2, 'hours').format('HH:mm');
  }

  lahtoChanged = lahto => {
    console.log(lahto);
    this.setState({ lahtopaikka: lahto }, () => this.componentDidMount());
  };

  /*filters(lahto){
      const asd = this.state.trains.filter(i => i.timeTableRows.stationShortCode === lahto)
      this.setState({
        trains: _.values(asd)
      });
  } */

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
    const sliced = sorted.slice(0, 10);

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

          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.junatext}>Juna</Text>
            <Text style={styles.junatext1}>Lähtee</Text>
            <Text style={styles.junatext1}>Pääteasema</Text>
            <Text style={styles.junatext1}>Saapuu</Text>
          </View>
          <View>
            {itemRows}
          </View>

          renderSeparator=
          {(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
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
