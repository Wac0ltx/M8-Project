import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View } from 'react-native';

export default class textfield extends Component {
  constructor(props) {
    super(props);
    this.state = {text: ''};
  }

  render() {
    return (
      <View style={{padding: 10}}>
        <TextInput ref={'lahtopaikka'}
          style={{height: 40}}
          placeholder="Lähtöpaikka"
        />
       <TextInput ref={'paateasema'}
          style={{height: 40}}
          placeholder="Pääteasema"
        />
      </View>
    );
  }
}

// skip this line if using Create React Native App
//AppRegistry.registerComponent('AwesomeProject', () => UselessTextInput);
