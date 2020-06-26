import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

require('firebase/auth')
var config = {
    apiKey: "AIzaSyA1Fow_To1drQw7bMN9ZmIwudARbx4aXPk",
    authDomain: 'react-slack-ha.firebaseapp.com',
    databaseURL: 'https://react-slack-ha.firebaseio.com',
    projectId: 'react-slack-clone',
    storageBucket: 'react-slack-ha.appspot.com',
    messagingSenderId: '482413775569'
}

firebase.initializeApp(config)

export default firebase;