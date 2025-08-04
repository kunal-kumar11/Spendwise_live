


const token = localStorage.getItem('token');

let currentPage = 1;

let limit = parseInt(localStorage.getItem('expensesPerPage')) || 5;
let count=0;
let updateId=null;
axios.get('https://spendwise-livepoint.onrender.com/api/userDetails', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then((result) => {
  count = result.data.totalCount;
  console.log("Total Count:", count);
})
.catch((error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    
   
    window.location.href = '/login';
  } else {
    console.error("Error fetching total count:", error);
  }
});

const tbody = document.querySelector('tbody');

const currentPageSpan = document.getElementById('current-page');
const rowsPerPageDropdown = document.getElementById('rows-per-page');


document.addEventListener('DOMContentLoaded', () => {
  
 rowsPerPageDropdown.value = limit;
  loadItems(currentPage);

});


function updateRowPerPage(){
  
  limit=parseInt(rowsPerPageDropdown.value)
  currentPage=1;
 
  loadItems(currentPage)

}


function loadItems(page = 1) {
  axios.get(`/api/userDetails?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => {
    
    const { expenses, totalCount } = res.data;
    const paginationContainer = document.getElementById('pagination-controls');

    if(totalCount==0){
      paginationContainer.style.display = 'none';
    }else{
      paginationContainer.style.display = 'block';
    }
      const change_page=document.getElementById("change_page")
    if(totalCount<=limit){  
      change_page.style.display='none';
    }else{
      change_page.style.display='block';
    }

    tbody.innerHTML = ''; // Clear previous rows

    expenses.forEach((items)=>{

         displayItem(items)
    });

    localStorage.setItem('expensesPerPage',limit)
    updatePaginationControls(totalCount);
  }).catch((error) => {
    console.log('Fetch failed:', error);
  });
}

function updatePaginationControls(totalCount) {
  const totalPages = Math.ceil(totalCount / limit);
  currentPageSpan.textContent = `Page ${currentPage}`;
  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
}

function changePage(direction) {
 
  if (direction === 'next') currentPage++;
  else if (direction === 'prev') currentPage--;

  loadItems(currentPage);
}

function handleSubmit(event) {
  event.preventDefault();

  const description = event.target.description.value.trim();
  const amount = parseFloat(event.target.amount.value.trim());
  const category = event.target.category.value.trim();

  if (!description || isNaN(amount) || !category) {
    alert("All fields are required");
    return;
  }

  if (amount<0) {
    alert("Expense is amount is negative");
    return;
  }

  const obj = { description, amount, category };

if (updateId) {
  axios.put(`https://spendwise-livepoint.onrender.com/api/userDetailsUpdate/${updateId}`, obj, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((result) => {
    const updatedData = result.data.updatedExpense; 

    const rowToUpdate = document.querySelector(`tr[data-expense-id="${updateId}"]`);
    console.log(rowToUpdate);

    if (rowToUpdate) {
      rowToUpdate.children[1].textContent = updatedData.description;
      rowToUpdate.children[2].textContent = updatedData.amount?.$numberDecimal || updatedData.amount;
      rowToUpdate.children[3].textContent = updatedData.category;
    }

    updateId = null;
    event.target.reset();
  }).catch((error) => {
    console.log('Update failed:', error);
  });
}
 else {
    // POST request for new entry
    axios.post('https://spendwise-livepoint.onrender.com/api/userDetails', obj, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      count++;
      axios.get(`/api/userDetails`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const totalCount = res.data.totalCount;
        currentPage = Math.ceil(totalCount / limit);
        loadItems(currentPage);
        document.getElementById("Leaderboard").style.display = "none";
      });

      event.target.reset();
    }).catch((error) => {
      console.log('Add failed:', error);
    });
  }
}


function displayItem(result) {
  const { description, amount, category, _id, createdAt } = result;

  const tr = document.createElement('tr');
  tr.setAttribute('data-expense-id', _id);

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : '';

  tr.innerHTML = `
    <td>${formattedDate}</td>
    <td>${description}</td>
    <td>${amount.$numberDecimal || amount}</td>
    <td>${category}</td>
    <td>
      <button class="delbtn">Delete</button><br>
      <button class="editbtn">Edit</button>
    </td>
  `;
  tbody.appendChild(tr);
}


tbody.addEventListener('click', (event) => {
 
  if (event.target.classList.contains('delbtn')) {
  
    const row = event.target.closest('tr');
    
    const id = row.dataset.expenseId;
  
    axios.delete(`https://spendwise-livepoint.onrender.com/api/userDetails/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      
      console.log("this is count "+ count);
        count--;
       
      let page=Math.ceil(count/limit);
      if(currentPage!=page){
        currentPage=page;
      }
      console.log("this is the page "+page)
      loadItems(page); 
      
     const Leaderboard=document.getElementById("Leaderboard")
      Leaderboard.style.display="none";// Reload current page
    }).catch((error) => {
      console.log('Delete failed:', error);
    });

  } else if (event.target.classList.contains('editbtn')) {
    const row = event.target.closest('tr');
    const id = row.dataset.expenseId;

    const tds = row.querySelectorAll('td');

    // Set values to input fields
    document.getElementById('description').value = tds[1].innerText;
    document.getElementById('amount').value = tds[2].innerText;
    document.getElementById('category').value = tds[3].innerText;
    updateId=id;
      
    const Leaderboard=document.getElementById("Leaderboard")
      Leaderboard.style.display="none";
    
  }
});

function displayLeaderboard() {
  axios.get('https://spendwise-livepoint.onrender.com/api/usersTotalsum')
    .then((result) => {
      const Leaderboard = document.getElementById('Leaderboard');
      Leaderboard.innerHTML=''
      result.data.forEach((items) => {
        const { username, totalexpenses } = items;

        // Handle Decimal128 properly
        const amount = totalexpenses?.$numberDecimal
          ? parseFloat(totalexpenses.$numberDecimal)
          : totalexpenses;

        const li = document.createElement('li');
        li.textContent = `${username} has total expense of ₹${amount}`;
        Leaderboard.appendChild(li);
      });
    })
    .catch((error) => {
      console.log('Leaderboard fetch failed:', error);
    });
}


LeaderboardBtn.addEventListener('click', () => {
  const Leaderboard = document.getElementById('Leaderboard');
  
  if (Leaderboard.style.display === "none" || Leaderboard.style.display === "") {
    displayLeaderboard(); 
    Leaderboard.style.display = "block";  
  } else {
    Leaderboard.style.display = "none";   
  }
});


document.getElementById('download-csv-btn').addEventListener('click', () => {
  axios.get('https://spendwise-livepoint.onrender.com/api/userDetails/download', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob'  // Make sure to handle CSV download as a blob
  })
  .then((response) => {
    // Handle the response (e.g., download the CSV)
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    document.body.appendChild(a);
    a.click();
  })
  .catch((error) => {

    console.error('CSV download failed:', error);
  });
});


document.addEventListener('DOMContentLoaded', () => {
  
  if (token) {
    try {
      const decodedToken = jwt_decode(token);  // Correct usage: jwt_decode
  
      if (decodedToken.premiumUser === true) {
        // Show premium features
        const buyPremium = document.getElementById('buyPremium');
        buyPremium.setAttribute('hidden', 'true');

        const leaderBoardBtn = document.getElementById('LeaderboardBtn');
        const downloadBtn = document.getElementById('download-csv-btn');
        downloadBtn.removeAttribute('hidden');
        leaderBoardBtn.removeAttribute("hidden");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
});
