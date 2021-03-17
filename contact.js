"use strict";

let formDataToJson = function(data) {
  let result = {};
  for (let [key, val] of data.entries()) {
    result[key] = val;
  }
  return result;
};

let Contact = {
  addContact(contactInfo) {
    let json = formDataToJson(contactInfo);
    let tags = json.tags.split(',');
    let uniqueTags = tags.filter((val, idx) => tags.indexOf(val) === idx);
    json.tags = uniqueTags.join(',');
    debugger;
    fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {
      if (!response.ok) {
        console.warn('Post Request to Add Contact Failed');
      }
    })
  },
  async getAllContacts() {
    let response = await fetch('/api/contacts');
    if (response.ok) {
      return await response.json();
    } else {
      console.warn('Get Request for All Contacts Failed');
    }
  },
  async getContact(id) {
    let response = await fetch(`/api/contacts/${id}`)
    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Get Request for Contact ${id} Failed`)
    }
  },
  editContact(id, contactInfo) {
    let json = formDataToJson(contactInfo);
    fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {
      if (!response.ok) {
        console.warn(`Post Request to Edit Contact ${id} Failed`);
      }
    })
  },
  deleteContact(id) {
    fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        console.warn(`Delete Request for Contact ${id} Failed`);
      }
    })
  },
}