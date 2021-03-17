"use strict";

document.addEventListener('DOMContentLoaded', () => {
  let UI = {
    init() {
      this.Add_Search_Div = document.querySelector('#AddSearch');
      this.Tag_List_Div = document.querySelector('#tagSelector');
      this.Default_Contacts_Div = document.querySelector('#defaultContacts');
      this.Create_Contact_Div = document.querySelector('#createContact');
      this.Edit_Contact_Div = document.querySelector('#editContact');
      this.Search_Results_Div = document.querySelector('#searchResults');
      this.Tag_Results_Div = document.querySelector('#tagResults');

      let tagResultsTemplate = document.querySelector("#tagResultsTemplate").innerHTML;
      this.tagResultsTemplateCompiled = Handlebars.compile(tagResultsTemplate);

      let searchResultsTemplate = document.querySelector("#searchResultsTemplate").innerHTML;
      this.searchResultsTemplateCompiled = Handlebars.compile(searchResultsTemplate);

      let tagsTemplate = document.querySelector("#tagsTemplate").innerHTML;
      this.tagsTemplateCompiled = Handlebars.compile(tagsTemplate);

      let editContactTemplate = document.querySelector("#editContactTemplate").innerHTML;
      this.editContactTemplateCompiled = Handlebars.compile(editContactTemplate);

      let defaultContactsTemplate = document.querySelector("#defaultContactsTemplate").innerHTML;
      this.defaultContactsTemplateCompiled = Handlebars.compile(defaultContactsTemplate);

      let individualContactTemplate = document.querySelector("#individualContactTemplate").innerHTML;
      this.individualContactTemplateCompiled = Handlebars.compile(individualContactTemplate)
      Handlebars.registerPartial('individualContact', this.individualContactTemplateCompiled);

      return this;
    },
    hide(element) {
      element.classList.add('hidden');
    },
    show(element) {
      element.classList.remove('hidden');
    },
    displayAddSearch() {
      this.show(this.Add_Search_Div);
    },
    displayTagList() {
      this.show(this.Tag_List_Div);
    },
    displayDefaultContacts() {
      this.hide(this.Create_Contact_Div);
      this.hide(this.Edit_Contact_Div);
      this.hide(this.Search_Results_Div);
      this.hide(this.Tag_Results_Div);
      this.show(this.Default_Contacts_Div);
    },
    displayCreateContact() {
      this.hide(this.Add_Search_Div);
      this.hide(this.Default_Contacts_Div);
      this.show(this.Create_Contact_Div);
    },
    displayEditContact() {
      this.hide(this.Add_Search_Div);
      this.hide(this.Default_Contacts_Div);
      this.show(this.Edit_Contact_Div);
    },
    displaySearchResults() {
      this.hide(this.Default_Contacts_Div);
      this.show(this.Search_Results_Div);
    },
    displayTagResults() {
      this.hide(this.Default_Contacts_Div);
      this.show(this.Tag_Results_Div);
    },
    fillTags(tagsArray) {
      let HTML = this.tagsTemplateCompiled({ tags: tagsArray });
      this.Tag_List_Div.innerHTML = HTML;
    },
    fillDefaultContacts(contactsArray) {
      let HTML = this.defaultContactsTemplateCompiled({ contacts: contactsArray })
      this.Default_Contacts_Div.innerHTML = HTML;
    },
    fillEditContact(contactInfo) {
      let HTML = this.editContactTemplateCompiled(contactInfo);
      this.Edit_Contact_Div.querySelector('fieldset').innerHTML = HTML;
    },
    fillSearchResults(searchTerm, contactsArray) {
      let HTML = this.searchResultsTemplateCompiled({ contacts: contactsArray, search: searchTerm, });
      this.Search_Results_Div.innerHTML = HTML;
    },
    fillTagResults(contactsArray) {
      let HTML = this.tagResultsTemplateCompiled({ contacts: contactsArray });
      this.Tag_Results_Div.innerHTML = HTML;
    },
  };

  let App = {
    init() {
      this.ContactsManager = Object.create(Contact);
      this.TagsManager = Object.create(Tag).init();

      this.ui = Object.create(UI).init();
      this.createContactForm = document.querySelector('#createContactForm');
      this.editContactForm = document.querySelector('#editContactForm');

      this.paintDefault();
      this.addBindings();
      return this;
    },
    paintDefault() {
      this.ContactsManager.getAllContacts()
      .then(json => {
        this.ui.fillDefaultContacts(json);
        this.ui.displayDefaultContacts();

        let tags = json.map(info => info.tags);
        this.TagsManager.createNewTags(tags);
        this.ui.fillTags(this.TagsManager.getAllTags());
        this.ui.displayTagList();

        this.ui.displayAddSearch();

        this.addContactBinding();
        this.editContactBinding();
        this.deleteContactBinding();
        this.tagListBinding();
      });
    },
    editContactBinding() {
      document.querySelectorAll('.EditContact').forEach(button => {
        button.addEventListener('click', event => {
          let contactId = event.target.dataset.contactid;

          this.ContactsManager.getContact(contactId)
          .then(json => {
            this.ui.fillEditContact(json);
            this.ui.displayEditContact();
          });
        });
      });
    },
    deleteContactBinding() {
      document.querySelectorAll('.DeleteContact').forEach(button => {
        button.addEventListener('click', event => {
          let contactId = event.target.dataset.contactid;

          if (window.confirm('Do you want to delete the contact?')) {
            this.ContactsManager.deleteContact(contactId);
            this.paintDefault();
          }
        });
      });
    },
    addContactBinding() {
      document.querySelectorAll('.AddContact').forEach(button => {
        button.addEventListener('click', event => {
          event.preventDefault();
          this.ui.displayCreateContact();
        })
      })
    },
    searchBoxBinding() {
      document.querySelector('#searchBox').addEventListener('keyup', event => {
        if (event.target.value) {
          let searchTerm = event.target.value;
          let pattern = new RegExp(searchTerm, 'gi');

          this.ContactsManager.getAllContacts()
          .then(json => {
            let contacts = json.filter(({full_name}) => pattern.test(full_name));
            this.ui.fillSearchResults(searchTerm, contacts);
            this.ui.displaySearchResults();
          });
        } else {
          this.paintDefault();
        }
      });
    },
    createContactFormBinding() {
      this.createContactForm.addEventListener('submit', event => {
        event.preventDefault();
        let newContactFormData = new FormData(this.createContactForm);
        this.createContactForm.reset();
        this.ContactsManager.addContact(newContactFormData);
        this.paintDefault();
      });

      this.createContactForm.addEventListener('reset', () => {
        this.paintDefault();
      });
    },
    editContactFormBinding() {
      this.editContactForm.addEventListener('submit', event => {
        event.preventDefault();
        let contactId = this.editContactForm.querySelector('dl').dataset.contactid;
        let editedContactFormData = new FormData(this.editContactForm);
        this.editContactForm.reset();

        this.ContactsManager.editContact(contactId, editedContactFormData);
        this.paintDefault();
      });

      this.editContactForm.addEventListener('reset', (event) => {
        event.preventDefault();
        this.editContactForm.reset();
        this.paintDefault();
      });
    },
    tagListBinding() {
      let tagList = document.querySelector('ul.tags');
      tagList.addEventListener('click', event => {
        if (event.target.classList.contains('clicked')) {
          event.target.classList.remove('clicked');
          this.paintDefault();
        } else if (event.target.tagName === 'LI') {
          tagList.querySelectorAll('li').forEach(item => {
            item.classList.remove('clicked');
          });
          event.target.classList.add('clicked');

          let tag = event.target.textContent;
          tag = tag.replace(/ \(\d+\)/, '');
          this.ContactsManager.getAllContacts()
          .then(json => {
            let contacts = json.filter(({tags}) => {
              return tags.split(',').includes(tag);
            });
            this.ui.fillTagResults(contacts);
            this.ui.displayTagResults();
          });
        }
      });
    },
    addBindings() {
      this.addContactBinding();
      this.searchBoxBinding();
      this.createContactFormBinding();
      this.editContactFormBinding();
    },
  };

  Object.create(App).init();
});