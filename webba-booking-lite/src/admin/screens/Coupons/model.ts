import CouponsModel from '../../../schemas/coupons.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const couponsModel = removePrefixesFromModelFields(
    CouponsModel,
    'coupon_'
)

export const mockedCoupon = {}
