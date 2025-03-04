import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    // Store permissions as an array of permission names for simplicity
    permissions: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      // Extract permission names from the user's permissions (from the API)
      state.permissions = user.permissions.map(p => p.name);
    }
  },
  actions: {
    login({ commit }, credentials) {
      return axios.post('http://your-api-domain/api/login', credentials)
        .then(response => {
          commit('setUser', response.data.user);
          // Set token for future API calls
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token;
        });
    }
  }
});
