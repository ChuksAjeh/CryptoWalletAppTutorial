import axios from "axios";

export const GET_HOLDINGS_BEGIN ="GET_HOLDINGS_BEGIN"
export const GET_HOLDINGS_SUCCESS = "GET_HOLDINGS_SUCCESS"
export const GET_HOLDINGS_FAILURE = "GET_HOLDINGS_FAILURE"
export const GET_COIN_MARKET_BEGIN = "GET_COIN_MARKET_BEGIN"
export const GET_COIN_MARKET_SUCCESS = "GET_COIN_MARKET_SUCCESS"
export const GET_COIN_MARKET_FAILURE = "GET_COIN_MARKET_FAILURE"


//Holding / My Holdings -> This is to populate the data for
//for the home and portfolio holdings section

export const getHoldingsBegin = () => ({
    type: GET_HOLDINGS_BEGIN
})

export const getHoldingsSuccess = (myHoldings) => ({
    type: GET_HOLDINGS_SUCCESS,
    payload: {myHoldings} //will be sent to the marketReducer
})

export const getHoldingsFailure = (error) => ({
    type: GET_HOLDINGS_FAILURE,
    payload: {error}
})


export function getHoldings(holdings=[], currency = "gbp", orderBy="market_cap_desc", sparkline = true, priceChangePerc ="7d",perPage =10, page=1){
    return dispatch => {
        dispatch(getHoldingsBegin())

        let ids = holdings.map((item) => {return item.id }).join(",")
        let apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=${orderBy}&per_page=${perPage}&page=${page}&sparkline=${sparkline}&price_change_percentage=${priceChangePerc}&ids=${ids}`

        return axios({
            url:apiUrl,
            method:'GET',
            header: {
                Accept: "application/json"
            }
        }).then((response) => {
            if(response.status == 200){
                //handle data
                let myHoldings = response.data.map((item)=> {
                    //retrieve current holdings data -> current quantity
                    let coin = holdings.find(a => a.id == item.id)

                    // get the price of current coin from 7 days ago:
                    let price7d = item.current_price / (1+item.price_change_percantage_7d_in_currency * 0.01)

                    return{
                        id: item.id,
                        symbol: item.symbol,
                        name: item.name,
                        image: item.image,
                        current_price: item.current_price,
                        quantity: coin.qty,
                        total: coin.qty * item.current_price,
                        price_change_percantage_7d_in_currency: item.price_change_percantage_7d_in_currency,
                        holding_value_change_7d: (item.currency_price - price7d) * coin.qty,
                        sparkline_in_7d: {
                            value: item.sparkline_in_7d.price.map((price) => {
                                return price * coin.qty
                            })
                        }
                    }

                })
                dispatch(getHoldingsSuccess(myHoldings))
            }else{
                dispatch(getHoldingsFailure(response.data))
            }
        }).catch((error)=>{
            dispatch(getHoldingsFailure(error))
        })
    }
}

// Coin Market -> this is section for pulling the data for the 
//coin market place.