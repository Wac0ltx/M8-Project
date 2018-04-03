import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      trains: [],
      text: '',
      lahtopaikka: 'helsinki',
      saapumispaikka: '',
      stationShort: 'HKI',
      meta: '',
    };
  }

  componentDidMount() {
    var stationName = '';
    var stationShort = 'PSL';
    var meta = this.state.meta;
    var trainNo = '';
    var arrivalStation = '';
    var arrivalTime = '';

    fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ meta: responseJson });

        for (var i3 = 0; i3 < meta.length; i3++) {
          if (
            meta[i3].stationName.split(' asema')[0].toUpperCase() ===
              this.state.lahtopaikka.toUpperCase() &&
            meta[i3].stationName !== 'Helsinki Kivihaka'
          ) {
            this.setState({ stationShort: meta[i3].stationShortCode });
          } else if (
            meta[i3].stationName.toUpperCase() ===
            this.state.lahtopaikka.toUpperCase()
          ) {
            this.setState({ stationShort: meta[i3].stationShortCode });
          } else if (responseJson[i3].stationName === 'Helsinki Kivihaka') {
            stationShort = 'KHK';
          } else {
            stationShort = 'ERROR';
          }
          if (meta[i3].stationShortCode === this.state.stationShort) {
            if (meta[i3].stationName !== 'Helsinki Kivihaka') {
              stationName = meta[i3].stationName.split(' asema')[0];
            }
          }
        }

        fetch(
          'https://rata.digitraffic.fi/api/v1/live-trains/station/' +
            this.state.stationShort
        )
          .then(response => response.json())
          .then(responseData => {
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

              for (
                var i2 = 0;
                i2 < responseData[i].timeTableRows.length;
                i2++
              ) {
                let d = new Date();
                let currentHours = d.getHours();
                let currentMins = d.getMinutes();

                console.log(
                  'Tunnit: ' +
                    this.formatHours(
                      responseData[i].timeTableRows[i2].scheduledTime
                    ) +
                    ':' +
                    this.formatMins(
                      responseData[i].timeTableRows[i2].scheduledTime
                    )
                );

                if (
                  responseData[i].timeTableRows[i2].stationShortCode ===
                    stationShort &&
                  responseData[i].timeTableRows[i2].type === 'DEPARTURE' &&
                  this.formatHours(
                    responseData[i].timeTableRows[i2].scheduledTime
                  ) >= currentHours &&
                  this.formatMins(
                    responseData[i].timeTableRows[i2].scheduledTime
                  ) >= currentMins
                ) {
                  var departureTimeVar =
                    responseData[i].timeTableRows[i2].scheduledTime;
                  responseData[i].departureTime = departureTimeVar;
                }

                arrivalStation =
                  responseData[i].timeTableRows[i2].stationShortCode;
                responseData[i].arrivalStation = arrivalStation;

                arrivalTime = responseData[i].timeTableRows[i2].scheduledTime;
                responseData[i].arrivalTime = arrivalTime;

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
              }
            }

            this.setState({
              isLoading: false,
              trains: responseData,
            });
          });
      });
  }

  formatDate(date) {
    return moment.utc(date).add(2, 'hours').format('HH:mm');
  }
  formatHours(hour) {
    return moment.utc(hour).add(2, 'hours').format('HH');
  }
  formatMins(min) {
    return moment.utc(min).format('mm');
  }

  lahtoChanged = lahto => {
    console.log(lahto);
    this.setState({ lahtopaikka: lahto }, () => this.componentDidMount());
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    const sorted = this.state.trains.sort(function(a, b) {
      return a.departureTime > b.departureTime
        ? 1
        : a.departureTime < b.departureTime ? -1 : 0;
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

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
  },
  textinput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 15,
    padding: 5,
    fontSize: 25,
  },
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
});
