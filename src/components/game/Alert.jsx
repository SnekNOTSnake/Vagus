import React from 'react'
import PropTypes from 'prop-types'

/**
 * @param {{ err: Error }} props
 */
const Alert = ({ error }) => {
	return <div className="Alert">{error.message}</div>
}

Alert.propTypes = {
	error: PropTypes.instanceOf(Error).isRequired,
}

export default Alert
