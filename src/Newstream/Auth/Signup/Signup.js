import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { SignUpForm } from '../../Components/Forms/SignUp/SignUp';
import { AvatarUploader } from '../../Components/Uploader';
import './Signup.css';
import { CustIcon } from '../../Components/Svgs';

const SignUpPage = () => {
	const [imageUploading, setImageUploading] = useState(false);
	const [uploadedFile, setUploadedFile] = useState(null);

	return (
		<>
			<div className="signupPage h-100 d-flex flex-row align-items-center justify-content-center">
				<div className="signupMain_blk">
					<div className="signUpLogo">
						<CustIcon type="logo" className="logoSvg" />
					</div>
					<div className="ant-card">
						<div className="ant-card-body p-0">
							<Row className="signupRow">
								<Col className="signupProfile_blk d-flex flex-row align-items-center justify-content-center">
									<div className="signupProfile d-flex flex-column ">
										<AvatarUploader
											folderName="userProfile"
											setUploadingFlag={setImageUploading}
											fileUpload={setUploadedFile}
										/>
										<h6>Setup your Profile</h6>
										<p>Add and verify your profile information</p>
									</div>
								</Col>
								<Col className="signupProfile_form">
									<SignUpForm
										uploadingFlag={imageUploading}
										fileUploaded={uploadedFile}
									/>
								</Col>
							</Row>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export { SignUpPage };
