import React, { Component } from 'react';
import { StyleSheet, AppRegistry, Text, TextInput, View } from 'react-native';

class Trains extends Component {
 render() {
    return (
      <Text>Juna: {this.props.train}</Text>
    );
  }
}

class Train extends Component {
  render() {
    return (
      <Text> Saapuu: {this.props.arrive}</Text>
    );
  }
}

class Trainss extends Component {
  render() {
    return (
      <Text>  Lähtee: {this.props.depart}</Text>
    );
  }
}


export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {text: ''};
  }

  render() {
    return (
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
        <Text style={styles.text}>Lähtöpaikan junan aikataulut:</Text>
        <View style={styles.container2}>
            <Text>Tähän lista junista</Text>
            <View style={{flex:1, flexDirection: 'row'}}>
                <Trains train='1'/>
                <Train arrive='15:00'/>
                <Trainss depart='15:01'/>
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
    container1: {
        borderWidth: 1,
        padding: 10,
    },
    container2: {
        borderWidth: 1,
        padding: 20,
        height: 100
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
});