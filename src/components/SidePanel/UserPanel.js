import React from 'react'
import firebase from '../../firebase'
import AvatarEditor from 'react-avatar-editor'
import { Grid, Header, Icon, Dropdown, Image, Modal, Button, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';

class UserPanel extends React.Component {
	state = {
		previewImage: '',
		croppedImage: '',
		blob: '',
		uploadedCroppedImage: '',
		modal: false,
		user: this.props.currentUser,
		storageRef: firebase.storage().ref(),
		usersRef: firebase.database().ref('users'),
		userRef: firebase.auth().currentUser,
		metadata: {
			contentType: 'image/jpeg'
		}
	}

	dropdownOptions = () => [
		{
			key: 'user',
			text: (
				<span>
					Signed in as <strong>{this.state.user.displayName}</strong>
				</span>
			),
			disable: "true"
		},
		{
			key: 'avatar',
			text: <span onClick={this.openModal}>Change avatar</span>,
		},
		{
			key: 'signout',
			text: <span onClick={this.handleSignout}>Sign out</span>,
		},
	];

	handleSignout = () => {
		firebase
			.auth()
			.signOut()
			.then(() => console.log("Signed out"))
	};

	openModal = () => {
		this.setState({ modal: true });
	}

	closeModal = () => {
		this.setState({ modal: false });
	}

	handleChange = event => {
		const file = event.target.files[0];
		const reader = new FileReader();

		if (file) {
			reader.readAsDataURL(file)
			reader.addEventListener('load', () => {
				this.setState({ previewImage: reader.result })
			})
		}
	};

	handleCropImage = () => {
		if (this.AvatarEditor) {
			this.AvatarEditor.getImageScaledToCanvas().toBlob(blob => {
				let imageUrl = URL.createObjectURL(blob);
				this.setState({
					croppedImage: imageUrl,
					blob
				})
			})
		}
	};

	uploadCroppedImage = () => {
		const { storageRef, userRef, metadata, blob } = this.state;
		storageRef
			.child(`avatars/users/${userRef.uid}`)
			.put(blob, metadata)
			.then(snap => {
				snap.ref.getDownloadURL().then(downloadURL => {
					this.setState({ uploadedCroppedImage: downloadURL }, () => {
						this.changeAvatar();
					})
				})
			})
		console.log("Prepare to change");
	};

	changeAvatar = () => {
		this.state.userRef
			.updateProfile({
				photoURL: this.state.uploadedCroppedImage
			})
			.then(() => {
				console.log("Photo Url Updated");
				this.closeModal();
			})
			.catch(err => {
				console.error(err);
			})

		this.state.usersRef
			.child(this.state.user.uid)
			.update({ avatar: this.state.uploadedCroppedImage })
			.then(() => {
				console.log("User avatar updated");
			})
			.catch(err => {
				console.error(err);
			})
	}

	render() {
		const { user, modal, previewImage, croppedImage } = this.state;
		const {primaryColor} = this.props
		return (
			<Grid style={{ background: primaryColor }}>
				<Grid.Column>
					<Grid.Row style={{ padding: '1.2em', margin: 0 }}>

						<Header inverted floated="left" as="h2">
							<Icon name="code" />
							<Header.Content> SlackHa </Header.Content>
						</Header>


						<Header style={{ padding: '0.25em' }} as="h4" inverted>
							<Dropdown
								trigger={
									<span>
										<Image src={user.photoURL} spaced="right" avatar />
										{user.displayName}
									</span>
								}
								options={this.dropdownOptions()}
							/>
						</Header>
					</Grid.Row>
					<Modal basic open={modal} onClose={this.closeModal}>
						<Modal.Header>
							Change Avatar
					</Modal.Header>
						<Modal.Content>
							<Input
								onChange={this.handleChange}
								fluid
								type="file"
								label="New Avatar"
								name="previewImage"
							/>
							<Grid centered stackable columns={2}>
								<Grid.Row centered>
									<Grid.Column className="ui center aligned grid">
										{previewImage && (
											<AvatarEditor
												ref={node => (this.AvatarEditor = node)}
												image={previewImage}
												width={120}
												height={120}
												border={50}
												scale={1.2}
											/>
										)}

									</Grid.Column>
									<Grid.Column>
										{croppedImage && (
											<Image
												style={{ margin: '3.5em auto' }}
												height={100}
												width={100}
												src={croppedImage}
											/>
										)}
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Modal.Content>
						<Modal.Actions>
							{croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
								<Icon name="save" /> Change Avatar
							</Button>}
							<Button color="green" inverted onClick={this.handleCropImage}>
								<Icon name="image" /> Preview
							</Button>
							<Button color="red" inverted onClick={this.closeModal}>
								<Icon name="remove" /> Cancel
							</Button>
						</Modal.Actions>
					</Modal>
				</Grid.Column>
			</Grid>
		);
	}
};

export default connect(state => ({primaryColor: state.colors.primaryColor}), null)(UserPanel);