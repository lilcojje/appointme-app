import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

// Helper function to return the default state
const getDefaultState = () => {
  return {
    user: null,
    permissions: [],
    token: null,
    settings: {}
  };
};

export default new Vuex.Store({
  state: getDefaultState(),
  mutations: {
    setUser(state, user) {
      state.user = user;
      // Extract permission names from the user's permissions
      state.permissions = user.permissions || [];

    },
    setSettings(state, settings) {
      state.settings = settings;
    },
    setAccessToken(state, token) {
      state.token = token;
    },
    // Mutation to reset the state to its default values
    RESET_STATE(state) {
      Object.assign(state, getDefaultState());
    },
    updateUserBusinessName(state, newName) {
      state.user.business_name = newName;
    }
  },
  actions: {
    // Action to clear the Vuex store; call this.$store.dispatch('clearStore') from your component
    clearStore({ commit }) {
      commit('RESET_STATE');
    }
  },
  plugins: [createPersistedState()]
});
