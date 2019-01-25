import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import moment from "moment"

import * as s from "../styles/Dashboard.styles"
import Modal from "./Modals/Modal"
import Autocomplete from "./Maps/Autocomplete"
import { Form, GhostInput, Button } from "../styles/theme/styledComponents"
import { UserPropTypes } from "./propTypes"
import { openModal, closeModal } from "../redux/actions/modal"
import { updateUserWithMsg } from "../redux/actions/settings"

class DashboardHome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      formattedAddress: null,
      displayName: "",
      location: null,
      query: ""
    }
    this.inputRef = React.createRef()
  }

  componentDidMount() {
    const { user } = this.props
    if ((user && user.loginCount === 0) || !user.formattedAddress) {
      this.setState({ displayName: user.displayName || "" })
      this.props.openModal()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user.formattedAddress && !prevProps.user.formattedAddress) {
      this.props.closeModal()
    }
  }

  handleChange = key => e =>
    this.setState({
      [key]: e.target.value
    })

  updateUserValues = values => e => {
    e.preventDefault()
    const { user } = this.props
    const { displayName } = this.state
    const { formattedAddress, location } = values
    const update = { displayName }
    if (location.lat && location.lng)
      update.coordinates = [location.lat, location.lng]
    if (formattedAddress) update.formattedAddress = formattedAddress

    this.props.updateUserWithMsg(user.id, update, "User update successful!")
    this.setState({ location, formattedAddress })
  }

  render() {
    const { user, modalIsOpen } = this.props
    return (
      <s.DashboardStyles>
        {user.displayName && <h1>Hi, {user.displayName}!</h1>}
        {!user.displayName && <h1>Welcome {user.email}!</h1>}
        <div>Last login: {moment(user.lastLogin).format("LLL")}</div>
        <div>Login count: {user.loginCount}</div>
        {user.formattedAddress && <div>Location: {user.formattedAddress}</div>}

        <Autocomplete
          google={window.google}
          inputRef={this.inputRef}
          map={null}
        >
          {({ location, viewport, formattedAddress }) => {
            console.log("RENDER ARGS:", location, viewport, formattedAddress)
            return (
              <div>
                <Modal isOpen={modalIsOpen}>
                  {() => (
                    <div className="onboarding-flow">
                      <div className="flow-header">
                        <h4>Create your profile</h4>
                        <div>
                          This will give you a place to store trips and plan new
                          ones safely.
                        </div>
                      </div>
                      <Form
                        onSubmit={this.updateUserValues({
                          location,
                          formattedAddress
                        })}
                      >
                        <label>Display Name</label>
                        <GhostInput
                          value={this.state.displayName}
                          onChange={this.handleChange("displayName")}
                          placeholder="What should we call you?"
                        />
                        <label>Location</label>
                        <GhostInput
                          value={this.state.query}
                          onChange={this.handleChange("query")}
                          placeholder="Search for location..."
                          ref={this.inputRef}
                        />
                        <div>{formattedAddress}</div>
                        <div>{location.lat && location.lat + location.lng}</div>
                        <div className="text-align-right">
                          <Button className="btn">Save</Button>
                        </div>
                      </Form>
                    </div>
                  )}
                </Modal>
              </div>
            )
          }}
        </Autocomplete>
      </s.DashboardStyles>
    )
  }
}

DashboardHome.propTypes = {
  user: PropTypes.objectOf(UserPropTypes),
  modalIsOpen: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  updateUserWithMsg: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  user: state.auth.user,
  modalIsOpen: state.modal.isOpen
})

const mapDispatchToProps = {
  openModal,
  closeModal,
  updateUserWithMsg
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardHome)
