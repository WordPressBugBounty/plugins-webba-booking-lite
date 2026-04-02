import StaffMembersModel from '../../../schemas/staff_members.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const staffMembersModel = removePrefixesFromModelFields(
    StaffMembersModel,
    'staff_'
)

export const mockedStaffMember = {}

