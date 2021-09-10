import { gql } from 'apollo-boost';

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

export const GETALLREQUEST = gql`
	query getAllRequestsWeb(
		$page: Int
		$limit: Int
		$requestType: String
		$order: String
		$orderby: String
		$isAccepted: Boolean
		$time: String
		$lat: Float
		$lng: Float
		$distance: Float
		$isAssigned: Boolean
		$search: String
	) {
		getAllRequestsWeb(
			isAssigned: $isAssigned
			page: $page
			limit: $limit
			requestType: $requestType
			order: $order
			orderby: $orderby
			isAccepted: $isAccepted
			time: $time
			lat: $lat
			lng: $lng
			distance: $distance
			search: $search
		) {
			requests {
				requestId
				title
				price
				lat
				lng
				createdDate
				isAudio
				isVideo
				isImage
				isArticle
				isRaw
				isLive
				scheduleDate
				isOpen
				isAccepted
				isSubmitted
				note
				distance
				location
				createdBy {
					userId
					name
					profileImage
					slackUserId
					phoneNumber
				}
				stories {
					storyId
					storyLiveStream {
						url
					}
				}
				expiryDateTime
			}
			requestFilters {
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
			totalRequests
		}
	}
`;

export const GETALLSTORY = gql`
	query getAllstoryWeb(
		$page: Int
		$limit: Int
		$time: String
		$type: String
		$isPurchased: Boolean
		$isAssigned: Boolean
		$isOpen: Boolean
		$isIndependent: Boolean
		$isRequested: Boolean
		$search: String
		$categories :[String!]
	) {
		getAllstoryWeb(
			page: $page
			limit: $limit
			time: $time
			type: $type
			isPurchased: $isPurchased
			isAssigned: $isAssigned
			isOpen: $isOpen
			isIndependent: $isIndependent
			isRequested: $isRequested
			search: $search
			categories:$categories
		) {
			stories {
				storyId
				title
				storyDateTime
				price
				isPurchased
				isIndependant
				createdDate
				storyMedia {
					mediaName
					type
				}
				storyMediaWeb {
					images {
						mediaName
					}
					videos {
						mediaName
					}
					audios {
						mediaName
					}
					raw {
						mediaName
					}
				}
				request {
					price
					isAudio
					isImage 
					isArticle
					isRaw
					isVideo
					isOpen
				}
				createdBy {
					userId
					name
					profileImage
				}
			}
			storyCount
			storyFilters {
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
	}
`;

export const GET_ALL_TRANSACTIONS = gql`
	query getAllTransactions($month: Float) {
		getAllTransactions(month: $month) {
			transactionId
			amount
			transactionNumber
			createdDate
			paymentReciept
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
				purchased {
					purchasedBy {
						userId
						email
						name
						profileImage
					}
				}
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
					}
				}
			}
		}
	}
`;

export const GET_PROFILE = gql`
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
			storyMinPrice
			storyMaxPrice
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
			isLive
			createdDate
			updatedDate
			location
			storyDateTime
			lat
			lng
			isPurchased
			distance
			category {
				title
				categoryId
			}
			purchased {
				isPaid
			}
			storyMediaWeb {
				images {
					mediaName
				}
				videos {
					mediaName
				}
				audios {
					mediaName
				}
				raw {
					mediaName
				}
			}
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
				isImage 
				isArticle
				isRaw
				price
				createdDate
				note
				acceptedDate
				createdBy {
					name
					profileImage
					slackUserId
					phoneNumber
				}
			}
			ratings {
				rating
				comment
				createdDate
				createdBy {
					userId
					profileImage
					name
				}
				isHidden
			}
		}
	}
`;

export const GET_INVOICE = gql`
	query {
		getAllReporterInvoice {
			invoiceId
			invoice
			createdDate
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
			scheduleDate
			note
			isArchive
			createdDate
			expiryDateTime
			price
			reminder
			isAccepted
			isSubmitted
			distance
			publisherId
			createdBy {
				publisher {
					title
					publisherId
				}
			}
			stories {
				storyId
				price
				title
				createdDate
				createdBy {
					userId
					name
					profileImage
					phoneNumber
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
				}
				storyLiveStream {
					url
				}
			}
			createdBy {
				name
				profileImage
				slackUserId
				phoneNumber
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
	}
`;

export const GET_ONBOARDING_STATUS = gql`
	query {
		getWebScreenStatus {
			mapCard
			listView
			storyDetail
			submitStory
			header
			navbar
			breakingStory
		}
	}
`;

export const GET_VERSION_UPDATES = gql`
	query {
		getAllReleaseNote(type: "reporter") {
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

export const GET_SLACK_TEAM_ID = gql`
	query {
		getUserSettings {
			slackTeamId
		}
	}
`;

export const GET_LIVE_STORY_CARDS = gql`
	query getAllstoryWeb(
		$page: Int
		$limit: Int
		$time: String
		$type: String
		$isPurchased: Boolean
		$isAssigned: Boolean
		$isOpen: Boolean
		$search: String
	) {
		getAllstoryWeb(
			page: $page
			limit: $limit
			time: $time
			type: $type
			isPurchased: $isPurchased
			isAssigned: $isAssigned
			isOpen: $isOpen
			isLive: true
			search: $search
		) {
			stories {
				storyId
				title
				price
				isPurchased
				storyLiveStream {
					scheduleDate
					thumbnail
				}
			}
			storyCount
		}
	}
`;

export const GET_LIVE_STORY_BY_ID = gql`
	query getStory($storyId: String!) {
		getStory(storyId: $storyId) {
			title
			price
			location
			lat
			lng
			createdDate
			note
			isLive
			isPurchased
			purchased {
				isPaid
			}
			storyLiveStream {
				url
				thumbnail
				scheduleDate
				type
			}
			request {
				acceptedDate
				isOpen
				note
				createdBy {
					name
					profileImage
					createdDate
					phoneNumber
					slackUserId
				}
			}
			ratings {
				rating
				comment
				createdDate
				createdBy {
					userId
					profileImage
					name
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

export const GET_ALL_ACTIVE_CATEGORY = gql`
	query {
		getAllActiveCategory {
			categoryId
			title
			isActive
		}
	}
`;

export const GET_ALL_CATEGORY = gql`
	query {
		getAllFiletrCategory {
			categoryId
			title
			isActive
			slug
		}
	}
`;
export const GET_NOTIFICATION_SETTINGS = gql`
query{
	getMyNotificationSettings{
	  name
	  notgroupsettings{
		notificationGroupSettingId
		title
		description
		notificationSettings{
		  email
		  push
		}
	  }
	}
  }
`;

export const GET_COMPANY_PROFILE = gql`
query getCompanyDetails($publisherId:String){
	getCompanyDetails(publisherId:$publisherId){
	  publisherId
	  title
	  description
	  phone_number
	  logo_image
	  url
	  address1
	  address2
	  pincode
	  city
	  state
	  country
	  users{
		userId
		name
		email
		profileImage  
		role{
		  slug
		}
	  }
	}
  }
  `