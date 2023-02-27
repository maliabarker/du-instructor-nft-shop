App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load instructors.
    $.getJSON('../instructors.json', function(data) {
      var instructorsRow = $('#instructorsRow');
      var instructorTemplate = $('#instructorTemplate');

      for (i = 0; i < data.length; i ++) {
        instructorTemplate.find('.panel-title').text(data[i].name);
        instructorTemplate.find('img').attr('src', data[i].picture);
        instructorTemplate.find('.instructor-specialty').text(data[i].specialty);
        instructorTemplate.find('.btn-own').attr('data-id', data[i].id);

        instructorsRow.append(instructorTemplate.html());
      }
    });

    $.getJSON('../posessions.json', function(data) {
      var posessionsRow = $('#posessionsRow');
      var posessionTemplate = $('#posessionTemplate');

      for (i = 0; i < data.length; i ++) {
        posessionTemplate.find('.panel-title').text(data[i].name);
        posessionTemplate.find('img').attr('src', data[i].picture);
        posessionTemplate.find('.posession-owner').text(data[i].owner);
        posessionTemplate.find('.btn-own').attr('data-id', data[i].id);

        posessionsRow.append(posessionTemplate.html());
      }
    });
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('DUInstructors.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var DUInstructorsArtifact = data;
      App.contracts.DUInstructors = TruffleContract(DUInstructorsArtifact);
    
      // Set the provider for our contract
      App.contracts.DUInstructors.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markOwned();
    });    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-own', App.handleOwnership);
  },

  markOwned: function() {
    var instructorInstance;

    App.contracts.DUInstructors.deployed().then(function(instance) {
      instructorInstance = instance;

      return instructorInstance.getOwners.call();
    }).then(function(owners) {
      for (i = 0; i < owners.length; i++) {
        if (owners[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-instructor').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleOwnership: function(event) {
    event.preventDefault();

    var instructorId = parseInt($(event.target).data('id'));

    var instructorInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DUInstructors.deployed().then(function(instance) {
        instructorInstance = instance;

        // Execute adopt as a transaction by sending account
        return instructorInstance.adopt(instructorId, {from: account});
      }).then(function(result) {
        return App.markOwned();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
