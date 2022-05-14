export const SET_TRADE_MODAL_VISIBILITY = 'SET_TRADE_MODAL_VISIBILITY'

export const setTradeModalVisibilitySuccess = (isVisible) => ({
    type: SET_TRADE_MODAL_VISIBILITY,
    payload: { isVisible }
})



//We export a function that allows us to set the Modal //Visibility state
export function setTradeModalVisibility(isVisible) {
    return dispatch => {
        dispatch(setTradeModalVisibilitySuccess(isVisible))
    }
}

