import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/analytics';
let messaging = '';
// if(firebase.messaging.isSupported()) {
const initializeFirebase = firebase.initializeApp({
	// messagingSenderId:MessagingSenderId,
	// projectId: ProjectID,
	// apiKey: APIKey,
	// appId: APPId,
	apiKey: 'AIzaSyA0dscKqmA1zQAc119U71wzRNNwbBcHFyw',
	authDomain: 'the-newstream.firebaseapp.com',
	databaseURL: 'https://the-newstream.firebaseio.com',
	projectId: 'the-newstream',
	storageBucket: 'the-newstream.appspot.com',
	messagingSenderId: '398889006146',
	appId: '1:398889006146:web:eed79340c6445e8328e9db',
	measurementId: 'G-NXY3R1L4N1',
});
if (firebase.messaging.isSupported()) {
	messaging = initializeFirebase.messaging();
	messaging.usePublicVapidKey(
		// Project Settings => Cloud Messaging => Web Push certificates
		'BCJ-ehAoUeorozvgSHvUlpCnz1Qm5QubjWuO4nt-1y6LrHKj3DMrH0jXGnLYXmTdo99iIu_FKtZRtTjX0zvYp5w'
	);
} else {
	messaging = null;
}
export const analytics = initializeFirebase.analytics();
export { messaging };
