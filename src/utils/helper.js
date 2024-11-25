const defaultRoles = {
  admin: 'admin',
  user: 'user'
};
const defaultStatus = {
  pending: 'pending',
  scheduled: 'scheduled',
  contacted: 'contacted',
  registered: 'registered',
  closed: 'closed' // extra
};
const actionTypes = {
  email: 'email',
  call: 'call',
  directvisit: 'directvisit',
  sms: 'sms'
};
const actionSubTypes = {
  callmadecontacted: 'callmade-contacted',
  callmadenotcontacted: 'callmade-notcontacted',
  wrongnumber: 'wrongnumber',
  callreceived: 'callreceived',
  emailsent: 'emailsent',
  emailreceived: 'emailreceived',
  ivisited: 'ivisited',
  clientvisited: 'clientvisited'
};

module.exports = {
  defaultRoles,
  defaultStatus,
  actionTypes,
  actionSubTypes
};