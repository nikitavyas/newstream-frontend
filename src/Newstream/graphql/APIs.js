import gql from 'graphql-tag';

export const LOGIN = gql`
	mutation login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			accessToken
			user {
				name
				userId
				profileImage
				isManager
				isApplicant
				role {
					roleId
					slug
				}
				address {
					lat
					lng
				}
				lastActiveTime
				slackUserId
				email
				phoneNumber
				publisherId
				publisher {
					title
				}
				contracts {
					signed
					lastSignDate
				}
				isContractsPending
				isApprovalPending
				timeZone
			}
		}
	}
`;

// export const GET_STORIES = gql`
// query storyList($type:String,$time:String){
//   storyList(type:$type,time:$time)
//   {
//     storyId,
//     price,
//     title,
//     isIndependant,
//     createdDate,
//     updatedDate,
//     location
//     lat
//     lng
//     isPurchased,
//     storyMedia{
//       mediaName,
//       type
//     }
//     createdBy {
//       userId,
//       name,
//       profileImage
//     }
//     request  { title
//     lat,
//     lng,
//     location,
//     isOpen,
//     isVideo,
//     isAudio
//     }
//   }
// // }`;isOpen:true
// isAssigned:true
// isRequested:true
// isPurchased:true
// isBreaking:true
export const GET_STORIES = gql`
	query getAllstoryWeb(
		$isOpen: Boolean
		$isAssigned: Boolean
		$isRequested: Boolean
		$isPurchased: Boolean
		$isIndependent: Boolean
		$isGlobal: Boolean
		$time: String
		$page: Int
		$limit: Int
		$search: String
		$categories: [String!]
		$rating : Float
		$lat:Float
		$lng:Float
		$order:String
		$orderby:String
		$isPaid:Boolean
		$mediaType:[String!]
		$distance : Float
		$isProposal : Boolean		
) {
		getAllstoryWeb(
			isOpen: $isOpen
			isAssigned: $isAssigned
			isRequested: $isRequested
			isPurchased: $isPurchased
			isIndependent: $isIndependent
			isGlobal: $isGlobal
			time: $time
			page: $page
			limit: $limit
			search: $search
			categories: $categories
			rating : $rating
			lat:$lat
			lng:$lng
			order:$order
			orderby:$orderby
			isPaid:$isPaid
			mediaType:$mediaType
			distance:$distance
			isProposal : $isProposal
) {
			stories {
				storyId
				categoryId
				price
				title
				isIndependant
				isGlobal
				createdDate
				updatedDate
				location
				lat
				lng
				isPurchased
				avgrating
				distance
				isProposal
				publisher{
					publisherId
					title
					}
				storyMediaWeb {
					videos {
						mediaName
						thumbnail
						type
					}
					audios {
						mediaName
						type
					}
					images {
						mediaName
						type
					}
					raw {
						mediaName
						content
						type
					}
					article {
						mediaName
						content
						type
					}
				}
				storyLiveStream {
					url
					thumbnail
					type
				}
				createdBy {
					userId
					name
					profileImage
					deleted
					isApplicant
				}
				request {
					title
					lat
					lng
					location
					isOpen
					isVideo
					isAudio
				}
				category {
					categoryId
					title
				}
				ratings {
					ratingId
					rating
				}
				purchased {
					purchasedDate
					purchasedBy{
						userId
						name
					}
					isPaid
				}
			}
			storyFilters {
				name
				slug
				filters {
					filterId
					title
					value
					type
					slug
				}
			}

			storyCount
		}
	}
`;
export const GET_GLOBAL_MARKETPLACE = gql`
	query getAllMarketPlaceStories(
		$isOpen: Boolean
		$isAssigned: Boolean
		$isRequested: Boolean
		$isPurchased: Boolean
		$isIndependent: Boolean
		$time: String
		$page: Int
		$limit: Int
		$search: String
		$categories: [String!]
	) {
		getAllMarketPlaceStories(
			isOpen: $isOpen
			isAssigned: $isAssigned
			isRequested: $isRequested
			isPurchased: $isPurchased
			isIndependent: $isIndependent
			time: $time
			page: $page
			limit: $limit
			search: $search
			categories: $categories
		) {
			stories {
				storyId
				price
				title
				isIndependant
				createdDate
				updatedDate
				location
				lat
				lng
				isPurchased
				storyMediaWeb {
					videos {
						mediaName
						thumbnail
						type
					}
					audios {
						mediaName
						type
					}
					images {
						mediaName
						type
					}
					raw {
						mediaName
						content
						type
					}
					article {
						mediaName
						content
						type
					}
				}
				createdBy {
					userId
					name
					profileImage
					deleted
					isApplicant
				}
				request {
					title
					lat
					lng
					location
					isOpen
					isVideo
					isAudio
				}
				category {
					categoryId
					title
				}
				ratings {
					ratingId
					rating
				}
			}
			storyFilters {
				name
				slug
				filters {
					filterId
					title
					value
					type
					slug
				}
			}
			storyCount
		}
	}
`;
export const GET_REQUEST_BY_ID = gql`
	query getRequest($requestId: String!) {
		getRequest(requestId: $requestId) {
			requestId
			note
			title
			lat
			lng
			location
			isOpen
			isVideo
			isAudio
			isImage
			isArticle
			isRaw
			isLive
			note
			isArchive
			createdDate
			expiryDateTime
			scheduleDate
			price
			reminder
			isAccepted
			publisherId
			createdBy {
				publisher {
					title
					publisherId
				}
			}
			newsrequest_users {
				user {
					name
					userId
				}
				isAccepted
			}
			stories {
				storyId
				price
				title
				createdDate
				location
				isPurchased
				createdBy {
					userId
					name
					profileImage
					deleted
					isApplicant
					address {
						address1
						address2
						city
						state
						country
						pincode
					}
					locations {
						lat
						lng
						address1
						address2
						city
						state
						country
						pincode
						location_type
					}
				}
				storyLiveStream {
					url
					thumbnail
					type
				}
				storyMedia {
					mediaName
					type
				}
			}
		}
	}
`;

export const GET_STORY_BY_ID = gql`
	query getStory($storyId: String!) {
		getStory(storyId: $storyId) {
			storyId
			price
			title
			note
			isIndependant
			createdDate
			updatedDate
			location
			storyDateTime
			lat
			lng
			isPurchased
			isGlobal
			isProposal
			category {
				title
				categoryId
				isGlobal 
			}
			storyMedia {
				mediaName
				type
				thumbnail
			}
			storyLiveStream {
				url
				type
				thumbnail
				isScheduled
				scheduleDate
			}
			publisher {
				title
				address1
				address2
				city
				state
				country
				pincode
				publisherId
				user {
					userId
					profileImage
					name
				}
			}
			purchased {
				purchasedDate
				purchasedBy{
					userId
					name
					profileImage
				}
				isPaid
			}
			request {
				title
				lat
				lng
				location
				isOpen
				isVideo
				isAudio
				isImage
				isArticle
				isLive
				isArchive
				isRaw
			}
			createdBy {
				userId
				name
				profileImage
				phoneNumber
				isActive
				deleted
				address {
					address1
					address2
					city
					state
					country
					pincode
				}
				slackUserId
				locations {
					lat
					lng
					address1
					address2
					city
					state
					country
					pincode
					location_type
				}
			}

			ratings {
				ratingId
				rating
				comment
				createdDate
				createdBy {
					userId
					name
					profileImage
				}
				abusedReports {
					ratingId
					reportedBy {
						userId
					}
				}
				isHidden
			}
			
		}
	}
`;

export const SAVE_REQUEST = gql`
	mutation saveRequest(
		$title: String!
		$note: String
		$isOpen: Boolean!
		$users: [String!]
		$location: String!
		$lat: Float!
		$lng: Float!
		$price: Float!
		$expiryDateTime: String
		$isVideo: Boolean!
		$isAudio: Boolean!
		$isImage: Boolean!
		$isLive: Boolean!
		$reminder: String
		$scheduleDate: String
		$proposalId: String
		$isArticle:Boolean!
		$isRaw:Boolean!
	) {
		saveRequest(
			requestInput: {
				title: $title
				note: $note
				isOpen: $isOpen
				newsrequest_users: $users
				location: $location
				lat: $lat
				lng: $lng
				price: $price
				expiryDateTime: $expiryDateTime
				isVideo: $isVideo
				isAudio: $isAudio
				isImage: $isImage
				isLive: $isLive
				reminder: $reminder
				scheduleDate: $scheduleDate
				proposalId: $proposalId
				isArticle: $isArticle
				isRaw: $isRaw
			}
		) {
			title
			price
		}
	}
`;

export const UPDATE_REQUEST = gql`
	mutation updateRequest(
		$title: String!
		$note: String
		$isOpen: Boolean!
		$users: [String!]
		$location: String!
		$lat: Float!
		$lng: Float!
		$price: Float!
		$expiryDateTime: String!
		$isVideo: Boolean!
		$isAudio: Boolean!
		$isImage: Boolean!
		$isLive: Boolean!
		$reminder: String
		$scheduleDate: String
		$requestId: String!
		$isArticle:Boolean!
		$isRaw: Boolean!
	) {
		updateRequest(
			requestInput: {
				title: $title
				note: $note
				isOpen: $isOpen
				newsrequest_users: $users
				location: $location
				lat: $lat
				lng: $lng
				price: $price
				expiryDateTime: $expiryDateTime
				isVideo: $isVideo
				isAudio: $isAudio
				isImage: $isImage
				isLive: $isLive
				reminder: $reminder
				scheduleDate: $scheduleDate
				requestId: $requestId
				isArticle: $isArticle
				isRaw: $isRaw
			}
		) {
			status
			message
		}
	}
`;

export const GET_INVITED_REPORTERS = gql`
	query {
		getInviteReporterList {
			inviteId
			email
			status
			createdDate
			firstName
			lastName
			createdBy {
				userId
				name
			}
			updatedDate
			updatedBy {
				userId
				name
			}
		}
	}
`;

export const GET_APPLICANTS = gql`
	query {
		getReporters(isApplicant: true) {
			userId
			email
			name
			isApplicant
			applicantStatus
			createdDate
			profileImage
		}
	}
`;

export const GET_ALL_REPORTERS = gql`
	query($search: String, $isActive: Boolean, $time: String) {
		getReporters(
			search: $search
			isActive: $isActive
			time: $time
			isApplicant: false
		) {
			userId
			name
			email
			isActive
			createdDate
			updatedDate
			profileImage
			lastActiveTime
			isApplicant
			address {
				address1
				address2
				city
				state
				country
				pincode
			}
			locations {
				lat
				lng
				address1
				address2
				city
				state
				country
				pincode
				location_type
			}
			createdBy {
				userId
				name
				profileImage
			}
			contracts {
				contract {
					name
					version
					signers {
						signedDate
					}
					createdDate
				}
				createdDate
				signedDate
				contractId
				signed
			}
			gracePeriod
		}
	}
`;

export const GET_ALL_REPORTERS_WEB = gql`
	query(
		$page: Float
		$limit: Float
		$order: String
		$orderby: String
		$isActive: Boolean
		$isApplicant: Boolean
		$search:String
	) {
		getAllReportersWeb(
			page: $page
			limit: $limit
			order: $order
			orderby: $orderby
			isActive: $isActive
			isApplicant: $isApplicant
			search:$search
		) {
			reporters {
				userId
				name
				email
				isActive
				createdDate
				updatedDate
				profileImage
				lastActiveTime
				isApplicant
				applicantStatus
				address {
					address1
					address2
					city
					state
					country
					pincode
				}
				locations {
					lat
					lng
					address1
					address2
					city
					state
					country
					pincode
					location_type
				}
				createdBy {
					userId
					name
					profileImage
				}
				contracts {
					contract {
						name
						version
						signers {
							signedDate
						}
						createdDate
					}
					createdDate
					signedDate
					contractId
					signed
				}
				gracePeriod
			}
			totalReporters
		}
	}
`;

export const GET_ALL_REPORTERS_INVITEE = gql`
	query(
		$page: Float
		$limit: Float
		$order: String
		$orderby: String
		$search:String
	
	) {
		getAllReporterInvites(
			page: $page
			limit: $limit
			order: $order
			orderby: $orderby
			search: $search
		) {
			invites {
				inviteId
				firstName
				lastName
				email
				status
				createdDate
				updatedDate
				createdBy {
					userId
					name
					profileImage
				}
				
			}
			totalInvites
		}
	}
`;

export const GET_ALL_ACTIVE_REPORTERS = gql`
	query($search: String, $isActive: Boolean, $time: String) {
		getAllActiveReporters(search: $search, isActive: $isActive, time: $time) {
			userId
			name
			email
			isActive
			createdDate
			updatedDate
			profileImage
			lastActiveTime
			isApplicant
			address {
				address1
				address2
				city
				state
				country
				pincode
			}
			locations {
				lat
				lng
				address1
				address2
				city
				state
				country
				pincode
				location_type
			}
			createdBy {
				userId
				name
				profileImage
			}
			contracts {
				contract {
					name
					version
					signers {
						signedDate
					}
					createdDate
				}
				createdDate
				signedDate
				contractId
				signed
			}
			gracePeriod
		}
	}
`;

export const REPORTER_INVITE = gql`
	mutation inviteReporter(
		$firstName: String!
		$lastName: String!
		$email: String!
		$contracts: [String!]!
	) {
		inviteReporter(
			inviteInput: {
				firstName: $firstName
				lastName: $lastName
				email: $email
				contracts: $contracts
			}
		) {
			inviteId
			email
			status
			firstName
			lastName
			createdDate
			createdBy {
				userId
				name
			}
		}
	}
`;
export const DELETE_INVITE = gql`
	mutation deleteReporterInvite($inviteId: String!) {
		deleteReporterInvite(inviteId: $inviteId) {
			status
			message
		}
	}
`;
export const RESEND_REPORTER_INVITE = gql`
	mutation resendReporterInvite($inviteId: String!) {
		resendReporterInvite(inviteId: $inviteId) {
			status
			updatedBy {
				userId
				name
				profileImage
			}
			updatedDate
		}
	}
`;

export const TOGGLE_BLOCK_REPORTER = gql`
	mutation toggleBlockReporter($userId: String!, $isActive: Boolean!) {
		toggleBlockReporter(userId: $userId, isActive: $isActive) {
			userId
			isActive
		}
	}
`;

export const REJECT_APPLICANT = gql`
	mutation rejectApplicantReporter($userId: String!) {
		rejectApplicantReporter(userId: $userId) {
			status
			message
		}
	}
`;

export const ACCEPT_APPLICANT = gql`
	mutation acceptApplicantReporter($userId: String!) {
		acceptApplicantReporter(userId: $userId) {
			status
			message
		}
	}
`;

export const SEND_CONTRACTS_TO_APPLICANT = gql`
	mutation sendContracts($userId: String!, $contracts: [String!]!) {
		sendContracts(userId: $userId, contracts: $contracts) {
			status
			message
		}
	}
`;

export const GET_ALL_TRANSACTIONS = gql`
	query {
		transactions {
			userId {
				userId
				name
			}
			stories {
				storyId
			}
		}
	}
`;
export const ALL_TRANSACTIONS = gql`
	query transactions {
		transactions {
			profileImage
			transactionId
			paymentReciept
			paymentType
			paymentStatus
			userId {
				userId
				name
			}
			stories {
				storyId
			}
		}
	}
`;
export const SAVE_TRANSACTION = gql`
	mutation saveRequest(
		$title: String!
		$note: String!
		$location: String!
		$lat: Float!
		$lng: Float!
		$price: Float!
		$expiryDateTime: String!
		$isVideo: Boolean!
		$isAudio: Boolean!
		$isImage: Boolean!
		$isRaw: Boolean!
	) {
		saveRequest(
			requestInput: {
				title: $title
				note: $note
				location: $location
				lat: $lat
				lng: $lng
				price: $price
				expiryDateTime: $expiryDateTime
				isVideo: $isVideo
				isAudio: $isAudio
				isImage: $isImage
				isRaw: $isRaw
			}
		) {
			title
			price
		}
	}
`;

export const GET_REQUESTS = gql`
	query getAllRequestsWeb(
		$withProposal: Boolean
		$isOpen: Boolean
		$isAssigned: Boolean
		$isArchive: Boolean
		$time: String
		$page: Int
		$limit: Int
		$search: String
		$isAccepted: Boolean
		$isProposal: Boolean
	) {
		getAllRequestsWeb(
			withProposal: $withProposal
			isOpen: $isOpen
			isAssigned: $isAssigned
			isArchive: $isArchive
			time: $time
			page: $page
			limit: $limit
			search: $search
			isAccepted : $isAccepted
			isProposal : $isProposal
		) {
			requests {
				requestId
				note
				title
				lat
				lng
				distance
				location
				isOpen
				isVideo
				isAudio
				isLive
				isImage
				isArticle
				isRaw
				note
				price
				expiryDateTime
				isArchive
				createdDate
				isSubmitted
				isAccepted
				createdBy {
					userId
					name
					profileImage
					phoneNumber
					slackUserId
					locations {
						lat
						lng
						address1
						address2
						city
						state
						country
						pincode
					}
					address {
						lat
						lng
						address1
						address2
						city
						state
						country
						pincode
					}
				}
				stories {
					storyId
					price
					title
					createdDate
					isPurchased
					purchased {
						isPaid
					}
					createdBy {
						userId
						name
						profileImage
						locations {
							lat
							lng
							address1
							address2
							city
							state
							country
							pincode
							location_type
						}
					}
					storyMedia {
						mediaName
						type
						thumbnail
					}
					storyLiveStream {
						url
						type
						thumbnail
						isScheduled
						scheduleDate
					}
				}
			}
			totalRequests
		}
	}
`;

export const GET_REQUEST_FILTER = gql`
	query {
		getRequestFilter(type: "time") {
			filterTypeId
			name
			slug
			filters {
				filterId
				title
				value
				type
				slug
			}
		}
	}
`;
export const GET_REPORTER_PROFILE = gql`
	query {
		getReporterProfile {
			userId
			name
			email
			phoneNumber
			profileImage
			slackUserId
			resume
			isApplicant
			applicantStatus
			address {
				address1
				address2
				city
				state
				country
				pincode
				lat
				lng
			}
		}
	}
`;
export const GET_PROFILE = gql`
	query {
		getJournalistProfile {
			userId
			name
			email
			phoneNumber
			slackUserId
			profileImage
			ongoingRequest
			completedRequest
			timeZone
			address {
				address1
				address2
				city
				state
				country
				pincode
			}
			isManager
		}
	}
`;

export const UPDATE_PROFILE = gql`
	mutation updateJournalistProfile(
		$name: String!
		$email: String!
		$phoneNumber: String
		$address1: String!
		$address2: String
		$city: String!
		$state: String!
		$country: String!
		$pincode: String!
		$profileImage: String
		$slackUserId: String,
		$timeZone:String
	) {
		updateJournalistProfile(
			userinput: {
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				profileImage: $profileImage
				slackUserId: $slackUserId
				timeZone: $timeZone
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
			message
			status
		}
	}
`;

export const SETUP_PROFILE = gql`
	mutation updateJournalistProfile(
		$name: String!
		$email: String!
		$phoneNumber: String!
		$profileImage: String!
		$slackUserId: String!
	) {
		updateJournalistProfile(
			userinput: {
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				profileImage: $profileImage
				slackUserId: $slackUserId
			}
		) {
			message
			status
		}
	}
`;

export const PURCHASE_STORY = gql`
	mutation buyStory($storyId: String!) {
		buyStory(storyId: $storyId) {
			status
		}
	}
`;

export const ARCHIVE_REQUEST = gql`
	mutation moveToArchiveRequest($requestId: String!) {
		moveToArchiveRequest(requestId: $requestId) {
			status
			message
		}
	}
`;

export const GET_REPORTER_BY_ID = gql`
	query getReporter($reporterId: String!) {
		getReporter(reporterId: $reporterId) {
			userId
			name
			email
			phoneNumber
			slackUserId
			profileImage
			isApplicant
			applicantStatus
			resume
			stories {
				storyId
				price
				title
				isIndependant
				createdDate
				updatedDate
				location
				lat
				lng
			}
			address {
				address1
				address2
				city
				state
				country
				pincode
			}
			locations {
				city
				address1
				address2
				state
				country
				pincode
				location_type
			}
			address {
				address1
			}
			purchasedStories {
				storyId
			}
			unPaidStories {
				storyId
				price
				title
				isIndependant
				createdDate
				updatedDate
				location
				lat
				lng
			}
			unpaidAmount
			paidAmount
			invoices {
				invoiceId
				invoice
				user {
					userId
					name
				}
				createdDate
			}
			contracts {
				contract {
					name
					version
					createdDate
				}
				lastSignDate
				signed
				createdDate
				signedDate
				contractId
				contractPdf
			}
			gracePeriod
			notes {
				noteId
				description
				reporterId
				createdBy {
					name
					profileImage
				}
				createdDate
			}
			ratings
		}
	}
`;

export const GET_PURCHASED_STORIES = gql`
	query getPurchasedStories(
		$isPaid: Boolean
		$time: String
		$page: Int
		$limit: Int
		$reporterId: String
		$isGlobal:Boolean
	) {
		getPurchasedStories(isPaid: $isPaid,
			 time: $time, 
			 page: $page, 
			 limit: $limit, 
			 reporterId: $reporterId
			 isGlobal:$isGlobal) {
			storyCount
			stories{
				storyId
				price
				title
				isIndependant
				createdDate
				updatedDate
				location
				lat
				lng
				isPurchased
				storyMedia {
					mediaName
					type
				}
				request {
					title
					lat
					lng
					location
					isOpen
					isVideo
					isAudio
				}
				createdBy {
					userId
					name
					profileImage
					isActive
					deleted
				}
				purchased {
					purchasedDate
					purchasedBy{
						userId
						name
					}
					isPaid
				}
			}
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

export const FORGOT_PASSWORD = gql`
	mutation forgotPassword($email: String!) {
		forgotPassword(email: $email) {
			status
			message
		}
	}
`;
export const FILE_UPLOADS = gql`
	mutation generateUrl($fileName: String!, $fileType: String!) {
		generateUrl(fileName: $fileName, fileType: $fileType)
	}
`;
export const FILE_DOWNLOADS = gql`
	query generateDownloadUrl($fileName: String!) {
		generateDownloadUrl(fileName: $fileName)
	}
`;
export const RESET_PASSWORD = gql`
	mutation res($password: String!) {
		resetPassword(password: $password) {
			status
			message
		}
	}
`;

export const GET_SETTINGS = gql`
	query {
		getUserSettings {
			notificationSettings {
				request
				story
				other
			}
			requestMinPrice
			requestMaxPrice
			inviteExpiryTime
			storyMaxPrice
			storyMinPrice
		}
	}
`;

export const SAVE_SETTINGS = gql`
	mutation saveUserSettings(
		$request: Boolean
		$story: Boolean
		$other: Boolean
	) {
		saveUserSettings(
			settingInput: {
				notificationSettings: {
					story: $story
					request: $request
					other: $other
				}
			}
		) {
			message
			status
		}
	}
`;

export const GET_APP_CONFIG = gql`
	query {
		getAppConfig {
			webPages {
				privacyPolicy {
					title
					description
				}
				termsOfServices {
					title
					description
				}
				aboutUs {
					title
					description
				}
				contactUs {
					title
					description
				}
			}
			bucketDetails {
				BUCKET_NAME
				CLOUDFRONT_URL
			}
		}
	}
`;

export const GET_NOTIFICATIONS = gql`
	query getMyNotification($limit: Int, $page: Int) {
		getMyNotification(limit: $limit, page: $page) {
			notificationId
			title
			description
			function
			functionId
			createdDate
			isRead
			functionType
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
export const FCM_TOPIC_REGSITER = gql`
	mutation webTopicSubscriptions($token: String!) {
		webTopicSubscriptions(token: $token) {
			message
		}
	}
`;
export const UPDATE_REQUEST_PRICE = gql`
	mutation updateRequestPrice($price: Float!, $requestId: String!) {
		updateRequestPrice(price: $price, requestId: $requestId) {
			message
		}
	}
`;

export const SAVE_REPORTER = gql`
	mutation saveReporter(
		$userId: String!
		$email: String!
		$name: String!
		$contracts: [String!]!
		$gracePeriod: Float
	) {
		saveReporter(
			reporterInput: {
				userId: $userId
				email: $email
				name: $name
				contracts: $contracts
				gracePeriod: $gracePeriod
			}
		) {
			userId
		}
	}
`;

// Onboarding Tour Queries
export const ONBOARDING_MUTATION = gql`
	mutation saveWebScreenStatus(
		$listView: Boolean
		$mapView: Boolean
		$header: Boolean
		$navbar: Boolean
		$addrequest: Boolean
		$mapCard: Boolean
		$reporterPage: Boolean
		$marketplace: Boolean
	) {
		saveWebScreenStatus(
			screenStatus: {
				mapView: $mapView
				listView: $listView
				header: $header
				navbar: $navbar
				mapCard: $mapCard
				addrequest: $addrequest
				reporterPage: $reporterPage
				marketplace: $marketplace
			}
		) {
			listView
			mapView
			header
			navbar
			mapCard
			addrequest
			reporterPage
			marketplace
		}
	}
`;

export const GET_ONBOARDING_STATUS = gql`
	query {
		getWebScreenStatus {
			mapView
			listView
			header
			navbar
			addrequest
			reporterPage
			mapCard
			marketplace
		}
	}
`;

export const GET_VERSION_UPDATES = gql`
	query {
		getAllReleaseNote(type: "journalist") {
			title
			version
			type
			releaseDate
			description {
				featureName
				number
			}
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
export const GETAPPCONFIG = gql`
	query {
		getAppConfig {
			bucketDetails {
				CLOUDFRONT_URL
				COGNITO_POOL_ID
				COGNITO_POOL_REGION
				BUCKET_NAME
				BUCKET_REGION
			}
		}
	}
`;

export const GET_SLACK_TEAM_ID = gql`
	query {
		getUserSettings {
			slackTeamId
		}
	}
`;

export const GET_LIVE_STORIES = gql`
	query getAllstoryWeb(
		$isOpen: Boolean
		$isAssigned: Boolean
		$isPurchased: Boolean
		$page: Int
		$limit: Int
		$search: String
	) {
		getAllstoryWeb(
			isLive: true
			isOpen: $isOpen
			isAssigned: $isAssigned
			isPurchased: $isPurchased
			page: $page
			limit: $limit
			search: $search
		) {
			stories {
				storyId
				title
				location
				lat
				lng
				storyDateTime
				note
				price
				publisherId
				isIndependant
				isPurchased
				isLive
				createdDate
				updatedDate
				deleted
				isLive
				createdBy {
					name
				}
				request {
					scheduleDate
					location
				}
				storyLiveStream {
					url
					type
					thumbnail
					isScheduled
					scheduleDate
				}
				createdBy {
					userId
					name
					email
					slackUserId
					phoneNumber
					profileImage
				}
			}
			storyCount
		}
	}
`;

export const GET_LIVE_STORY = gql`
	query getStory($storyId: String!) {
		getStory(storyId: $storyId) {
			storyId
			price
			title
			note
			isIndependant
			createdDate
			updatedDate
			location
			storyDateTime
			lat
			lng
			isPurchased
			storyLiveStream {
				thumbnail
				url
				type
				scheduleDate
			}
			request {
				title
				lat
				lng
				location
				scheduleDate
				isOpen
				isVideo
				isAudio
				isImage
				isArticle
				isRaw
			}
			createdBy {
				userId
				name
				profileImage
				phoneNumber
				address {
					address1
					address2
					city
					state
					country
					pincode
				}
				slackUserId
				locations {
					lat
					lng
					address1
					address2
					city
					state
					country
					pincode
					location_type
				}
			}
			ratings {
				ratingId
				rating
				comment
				createdDate
				createdBy {
					userId
					name
					profileImage
				}
				abusedReports {
					ratingId
					reportedBy {
						userId
					}
				}
				isHidden
			}
		}
	}
`;

export const GET_ACTIVE_PAGES = gql`
	query {
		getActivePages {
			pageId
			title
			slug
			description
			createdBy
			updatedBy
			createdDate
			updatedDate
			isActive
			deleted
		}
	}
`;

export const GET_PAGE = gql`
	query($slug: String!) {
		getPage(slug: $slug) {
			pageId
			title
			slug
			description
			createdBy
			updatedBy
			createdDate
			updatedDate
			isActive
			deleted
		}
	}
`;

export const GET_USER_CONTRACTS = gql`
	query {
		getUserContracts {
			contractId
			zohoActionId
			zohoRequestId
			createdDate
			signed
			lastSignDate
			isApproved
			contract {
				name
				contractType
				version
				publisher {
					title
				}
			}
			signedDate
			contractPdf
		}
	}
`;

export const SIGN_CONTRACT = gql`
	query signContract($contractId: String!) {
		signContract(contractId: $contractId) {
			signUrl
		}
	}
`;
export const GET_ALL_CONTRACTS = gql`
	query {
		getAllContract {
			contractId
			contractType
			name
			zohoTemplateId
			createdDate
			updatedDate
			isActive
		}
	}
`;
export const ADD_CONTRACTS = gql`
	mutation createContract(
		$contractType: String!
		$name: String!
		$zohoTemplateId: String!
		$publisherId: String!
		$isActive: Boolean!
	) {
		createContract(
			contractInput: {
				contractType: $contractType
				name: $name
				zohoTemplateId: $zohoTemplateId
				publisherId: $publisherId
				isActive: $isActive
			}
		) {
			publisherId
		}
	}
`;

export const GET_ALL_REPORTER_CONTRACTS = gql`
	query {
		getReporterContract {
			contractId
			contractType
			name
			zohoTemplateId
			createdDate
			updatedDate
			isActive
			version
			isRequired
		}
	}
`;

export const GET_APPLICANT_NOTES = gql`
	query getReporterNotes($reporterId: String!) {
		getReporterNotes(reporterId: $reporterId) {
			noteId
			description
			reporterId
			createdBy {
				name
			}
			createdDate
		}
	}
`;

export const ADD_APPLICANT_NOTES = gql`
	mutation saveNote($reporterId: String!, $description: String!) {
		saveNote(
			noteInput: { reporterId: $reporterId, description: $description }
		) {
			noteId
		}
	}
`;

export const SAVE_RATINGS = gql`
	mutation addRating($storyId: String!, $rating: Float!, $comment: String) {
		addRating(
			ratingInput: { storyId: $storyId, rating: $rating, comment: $comment }
		) {
			message
			status
		}
	}
`;
export const REPORT_ABUSE = gql`
	mutation reportAbuse($ratingId: String!) {
		reportAbuse(ratingId: $ratingId) {
			message
			status
		}
	}
`;

export const RESEND_CONTRACT = gql`
	mutation resendContracts($contractId: String!, $userId: String!) {
		resendContracts(contractId: $contractId, userId: $userId) {
			status
			message
		}
	}
`;

export const GET_ALL_ACTIVE_CATEGORY = gql`
	query getAllFiletrCategory {
		getAllFiletrCategory {
			categoryId
			title
			slug
			isActive
		}
	}
`;
export const GET_NOTIFICATION_SETTINGS = gql`
	query {
		getMyNotificationSettings {
			name
			notgroupsettings {
				notificationGroupSettingId
				title
				description
				notificationSettings {
					email
					push
				}
			}
		}
	}
`;
export const SAVE_NOTIFICATION_SETTINGS = gql`
	mutation saveMyNotificationSettings(
		$notificationData:[NotificationInputSettings!]!
	) {
		saveMyNotificationSettings(
			settingInput: $notificationData
		) {
			message
		}
	}
`;
export const GET_ALL_TIMEZONE = gql`
	query {
		getAllTimeZones 
	}
`;

export const TOGGLE_GLOBAL_STORY = gql`
	mutation toggleGlobleStory($storyId: String!,$categoryId:String) {
		toggleGlobleStory(storyId: $storyId,categoryId:$categoryId){
			status
			message
		}
	}
`;

export const UPDATEREPORTERPROFILE_MUTATION = gql`
	mutation updateReporterProfile(
		$name: String!
		$email: String!
		$phoneNumber: String
		$address1: String!
		$address2: String
		$city: String!
		$state: String!
		$country: String!
		$pincode: String!
		$profileImage: String
		$slackUserId: String,
		$timeZone:String
	) {
		updateReporterProfile(
			reporterProfileInput: {
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				profileImage: $profileImage
				slackUserId: $slackUserId
				timeZone: $timeZone
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
			accessToken
			address {
				address1
				address2
			}
			message
			status
		}
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
export const GET_INVOICE = gql`
	query getAllReporterInvoice($page:Float , $limit:Float){
		getAllReporterInvoice(page:$page,limit :$limit) {
			totalInvoice
	        invoices{
				invoiceId
				invoice
				createdDate
		   }
		}
	}
`;
export const SAVESTORY_MUTATION = gql`
	mutation saveStory(
		$isIndependant: Boolean!
		$title: String!
		$storyMedia: [StoryMediaInputFields!]!
		$price: String
		$location: String!
		$lat: Float!
		$lng: Float!
		$note: String
		$requestId: String
		$storyDateTime: String!
		$categoryId: String
		$createdBy: String
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
				createdBy: $createdBy
				isProposal : $isProposal
			}
		) {
			storyId
		}
	}
`;
export const GET_ALL_ACTIVE_REPORTER_CATEGORY = gql`
	query {
		getAllActiveCategory {
			categoryId
			title
			isActive
		}
	}
`;

export const GET_ALL_REPORTER_TRANSACTIONS = gql`
	query getAllTransactions($month: Float,$page:Float,$limit:Float) {
	
		getAllTransactions(month: $month,page :$page,limit :$limit) {
			totalTransactions
			transactions{
			transactionId
			amount
			transactionNumber
			createdDate
			paymentReciept
			stories {
				storyId
				title
				price
				purchased {
					purchasedDate
					purchasedBy{
						userId
						name
					}
					isPaid
				}
			}
		}
		}
	}
`;

export const TRANSACTION_DETAILS = gql`
	query transaction($transactionId: String!) {
		transaction(transactionId: $transactionId) {
			transactionId
			transactionTitle
			transactionNumber
			paymentReciept
			createdDate
			amount
			stories {
				storyId
				title
				price
				createdDate
				isGlobal
				storyLiveStream {
					url
				}
				storyMediaWeb {
					audios {
						mediaName
					}
					videos {
						mediaName
					}
					images {
						mediaName
					}
					raw {
						mediaName
						content
					}
					article {
						mediaName
						content
					}
				}
			}
		}
	}
`;
export const SAVEREPORTERLOCATION_MUTATION = gql`
	mutation saveReporterLocation($lat: Float!, $lng: Float!,
		$city:String,
		$state:String,
		$country:String) {
		saveReporterLocation(
			locationInput: { lat: $lat, 
				lng: $lng, 
				city:$city,
				state:$state,
				country:$country,
				location_type: 0 
			}
		) {
			reporterLocationId
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
		$timeZone:String
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
				timeZone:$timeZone
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
		$timeZone:String
	) {
		signupReporter(
			reporterInput: {
				name: $name
				email: $email
				phoneNumber: $phoneNumber
				password: $password
				profileImage: $profileImage
				slackUserId: $slackUserId
				timeZone:$timeZone
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

export const INVITEREPORTLIST = gql`
	{
		getInviteReporter {
			inviteId
			email
			firstName
			lastName
			status
			createdBy {
				name
			}
			updatedBy {
				name
			}
		}
	}
`;

export const GET_ALL_STORY_FILTERS = gql`
 {
	getStoryFilters{
			storyFilters {
				name
				slug
				filters {
					filterId
					title
					value
					type
					slug
				}
			}
			categories{
				categoryId
				slug
				title
			}
		}
	}
`;

export const GET_GLOBAL_CATEGORIES = gql`
{
	getAllGlobalCategories{
		categoryId
		title
		slug
		isGlobal
	}
	}
`;

