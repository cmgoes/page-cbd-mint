import { CHANGE_TIMER } from "../actions/actionTypes"
  
  const initialState = {
    timer: true
  }
  
  // eslint-disable-next-line import/no-anonymous-default-export
  export default (state=initialState, action) => {
    switch(action.type) {
      case CHANGE_TIMER:
        return {
          ...state,
          timer: action.payload 
        }
      default: 
        return state;
    }
  }