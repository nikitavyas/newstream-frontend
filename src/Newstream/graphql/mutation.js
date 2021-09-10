import { gql } from 'apollo-boost';

export const SIGNUP_MUTATION = gql`
	mutation signupReporter(
		$name: String!
		$email: String!
		$phoneNumber: String!
		$password: String!
		$profileImage: String
		$slackUserId: String!
		$address1: String!
		$address2: String
		$city: String!
		$state: String!
		$country: String!
		$pincode: String!
	) {
		signupReporter(
			reporterInput: {
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				password: $password
				profileImage: $profileImage
				slackUserId: $slackUserId
				address: {
					address1: $address1
					address2: $address2
					city: $city
					state: $state
					country: $country
					pincode: $pincode
				}
			}
		) {
			accessToken
			userId
			email
			name
			isContractsPending
		}
	}
`;

export const LOGIN_MUTATION = gql`
	mutation login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			accessToken
			user {
				userId
				name
				email
				isApplicant
				applicantStatus
				profileImage
				address {
					address1
					city
					state
					country
				}
				finance {
					bankAccountNumber
					taxNumber
				}
				publisher {
					title
				}
				isContractsPending
				isApprovalPending
			}
		}
	}
`;

export const FORGOTPASSWORD_MUTATION = gql`
	mutation forgotPassword($email: String!) {
		forgotPassword(email: $email) {
			message
			status
		}
	}
`;

export const RESETPASSWORD_MUTATION = gql`
	mutation resetPassword($password: String!) {
		resetPassword(password: $password) {
			message
			status
		}
	}
`;

export const SAVEREPORTERLOCATION_MUTATION = gql`
	mutation saveReporterLocation($lat: Float!, $lng: Float!) {
		saveReporterLocation(
			locationInput: { lat: $lat, lng: $lng, location_type: 0 }
		) {
			reporterLocationId
		}
	}
`;

export const UPDATEREPORTERPROFILE_MUTATION = gql`
	mutation updateReporterProfile(
		$name: String!
		$email: String!
		$address: AddressFields
		$finance: ReporterFinanceInputFields
		$slackUserId: String!
	) {
		updateReporterProfile(
			reporterProfileInput: {
				name: $name
				email: $email
				address: $address
				finance: $finance
				slackUserId: $slackUserId
			}
		) {
			userId
			accessToken
			address {
				address1
				address2
			}
		}
	}
`;

export const FILE_UPLOADS = gql`
	mutation generateUrl($fileName: String!, $fileType: String!) {
		generateUrl(fileName: $fileName, fileType: $fileType)
	}
`;

export const DOCUMENT_UPLOADS = gql`
	mutation saveReporterInvoice($fileName: String!) {
		saveReporterInvoice(invoice: $fileName) {
			invoiceId
			invoice
			createdDate
		}
	}
`;

export const SAVESTORY_MUTATION = gql`
	mutation saveStory(
		$isIndependant: Boolean!
		$title: String!
		$storyMedia: [StoryMediaInputFields!]!
		$price: String!
		$location: String!
		$lat: Float!
		$lng: Float!
		$note: String
		$requestId: String
		$storyDateTime: String!
		$categoryId: String
		$isProposal : Boolean
	) {
		saveStory(
			storyinput: {
				isIndependant: $isIndependant
				title: $title
				requestId: $requestId
				storyMedia: $storyMedia
				price: $price
				location: $location
				lat: $lat
				lng: $lng
				note: $note
				storyDateTime: $storyDateTime
				categoryId: $categoryId
				isProposal: $isProposal
			}
		) {
			storyId
		}
	}
`;

export const ACCEPT_REQUEST = gql`
	mutation acceptRequest($requestId: String!) {
		acceptRequest(requestId: $requestId) {
			message
			status
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation changePassword($currentpassword: String!, $newpassword: String!) {
		changePassword(
			currentpassword: $currentpassword
			newpassword: $newpassword
		) {
			status
			message
		}
	}
`;

export const UPDATE_PROFILE = gql`
	mutation updateReporterProfile(
		$name: String!
		$email: String!
		$address1: String!
		$address2: String
		$city: String!
		$state: String!
		$country: String!
		$pincode: String!
		$profileImage: String
		$slackUserId: String!
		$resume: String
	) {
		updateReporterProfile(
			reporterProfileInput: {
				resume: $resume
				name: $name
				email: $email
				profileImage: $profileImage
				slackUserId: $slackUserId
				address: {
					address1: $address1
					address2: $address2
					city: $city
					state: $state
					country: $country
					pincode: $pincode
				}
			}
		) {
			userId
		}
	}
`;

export const SAVE_NOTIFICATION_SETTINGS = gql`
mutation saveMyNotificationSettings (
	$notificationGroupSettingId :String!,
	$email : Boolean!
	$push : Boolean!
	) {
	saveMyNotificationSettings(settingInput:[
	  {
		notificationGroupSettingId:$notificationGroupSettingId
		email:$email
		push:$push
	  }
	]){
	  message
	}
  }
`;

export const FCM_TOPIC_REGSITER = gql`
	mutation webTopicSubscriptions($token: String!) {
		webTopicSubscriptions(token: $token) {
			message
		}
	}
`;

export const READ_NOTIFICATION = gql`
	mutation notificationRead($notificationId: String!) {
		notificationRead(notificationId: $notificationId) {
			status
			message
		}
	}
`;

export const DELETE_INVOICE = gql`
	mutation deleteInvoice($invoiceId: String!) {
		deleteInvoice(invoiceId: $invoiceId) {
			message
			status
		}
	}
`;

export const ONBOARDING_MUTATION = gql`
	mutation saveWebScreenStatus(
		$listView: Boolean
		$mapCard: Boolean
		$storyDetail: Boolean
		$submitStory: Boolean
		$header: Boolean
		$navbar: Boolean
		$breakingStory: Boolean
	) {
		saveWebScreenStatus(
			screenStatus: {
				mapCard: $mapCard
				listView: $listView
				header: $header
				storyDetail: $storyDetail
				submitStory: $submitStory
				navbar: $navbar
				breakingStory: $breakingStory
			}
		) {
			listView
			mapCard
			storyDetail
			submitStory
			header
			navbar
			breakingStory
		}
	}
`;

export const FEEDBACK_MUTATION = gql`
	mutation saveFeedback(
		$category: Category!
		$description: String!
		$outcome: String
		$attachments: [String!]
	) {
		saveFeedback(
			feedBackInput: {
				category: $category
				description: $description
				outcome: $outcome
				attachments: $attachments
			}
		) {
			category
			description
			outcome
			attachments {
				name
			}
		}
	}
`;

export const SUBMIT_LIVE_STORY = gql`
	mutation saveStory(
		$storyId: String
		$isIndependant: Boolean!
		$isLive: Boolean!
		$title: String!
		$storyLiveStream: StoryLiveStreamInputDto
		$price: String!
		$location: String!
		$lat: Float!
		$lng: Float!
		$note: String
		$requestId: String
		$storyDateTime: String!
	) {
		saveStory(
			storyinput: {
				storyId: $storyId
				isIndependant: $isIndependant
				isLive: $isLive
				title: $title
				requestId: $requestId
				storyLiveStream: $storyLiveStream
				price: $price
				location: $location
				lat: $lat
				lng: $lng
				note: $note
				storyDateTime: $storyDateTime
			}
		) {
			storyId
		}
	}
`;

export const APPLICANT_REGISTER_MUTATION = gql`
	mutation signupTrialReporter(
		$name: String!
		$email: String!
		$phoneNumber: String!
		$password: String!
		$profileImage: String
		$slackUserId: String!
		$address1: String!
		$address2: String
		$city: String!
		$state: String!
		$country: String!
		$pincode: String!
		$resume: String!
		$publisherId: String!
	) {
		signupTrialReporter(
			reporterInput: {
				publisherId: $publisherId
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				password: $password
				profileImage: $profileImage
				slackUserId: $slackUserId
				resume: $resume
				address: {
					address1: $address1
					address2: $address2
					city: $city
					state: $state
					country: $country
					pincode: $pincode
				}
			}
		) {
			userId
			email
			name
		}
	}
`;

// export const UPDATE_COMPANY_DETAILS = gql`
// mutation updateCompanyDetails($url:String, $phone : String, 
// 	$description:String, $logo: String, $address1: String, $address2: String, 
// 	$city: String, $state: String, $country : String, $pincode: String){
// 	updateCompanyDetails(publisherInput:{
// 	  url:$url
// 	  phone_number:$phone
// 	  description:$description
// 	  logo_image:$logo
// 	  address1:$address1
// 	  address2:#address2
// 	  city:$city
// 	  state:$state
// 	  pincode:$pincode
// 	  country:$country
	  
// 	}){
// 	  publisherId
// 	  user{
// 		name
// 		email
// 	  }
// 	}
//   }
//   `