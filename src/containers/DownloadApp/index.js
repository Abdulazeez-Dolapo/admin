import React, { Component } from 'react';
import  PropTypes from 'prop-types';

import {
    Layout,
} from 'antd';

import AppHeader from '../DefaultLayout/Header';
import RsvpTable from '../RsvpTable';

const {
    Header,
    Content,
} = Layout;

class DownloadApp extends Component {

    render() {
      const {
        user,
        logOut,
      } = this.props;
      return (
        <Layout>
            <Header>
                <AppHeader 
                    userName={user.username}
                    logOut={logOut}
                />
            </Header>
            <Layout>  
                <Content>    
                    <RsvpTable
                    />
                </Content>
            </Layout>
        </Layout>
      )
    }

}

DownloadApp.propTypes = {
  activeEventTab: PropTypes.string.isRequired,
  changeActiveEventTab: PropTypes.func.isRequired,
  currentHashLocation: PropTypes.string.isRequired,
  getLocation: PropTypes.func.isRequired,
  getUserById: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
}

export default DownloadApp;
