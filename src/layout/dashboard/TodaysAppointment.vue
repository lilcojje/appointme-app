<template>
  <div id="todays">
    <div class="bg-video-wrap">
    <video src="https://kagay-an.ph/tv.mp4" loop muted autoplay preload="auto" >
    </video>
    <div class="overlay">
    </div>
    <!--Charts-->
    
    <div id="sched">
      <marquee class="marq"
                direction="up"
                id="tb" scrollamount="2" v-show="show_table">
      <h3 id="header-app">Today's Appointment</h3>
        
      <table class="table table-striped">
          <thead> 
              <th>Time</th>
              <th>First Name</th>
              <th>Services</th>
          </thead>
            <tbody v-if="appointments.total > 0">
                                              <tr v-for="(appointment,index) in appointments.data" :key="index">
                                                  <td>{{ appointment.time }}</td>
                                                  <td>{{ appointment.first_name }}</td>
                                                  <td>{{ appointment.formated_service }}</td>
                                              </tr>
            </tbody>
                                          <tbody v-else>
                                              <tr>
                                                  <td align="center" colspan="4" id="no-record">No Appointment.</td>
                                              </tr>
            </tbody>
     </table>
    </marquee>
      <div id="time">{{getDate()}} - {{current_time}}</div>
              <div slot="raw-content" class="table-responsive">
                <marquee id='scroll'>
                       <span v-if="appointments.total > 0">
                          <span>Today's Appointment: </span>
                          <span v-for="(appointment,index) in appointments.data" :key="index">
                                                        {{ appointment.time }} - {{ appointment.first_name }}
                          
                            <img src="https://kblapp.kagay-an.ph/img/logo.47f76915.png" width="50" height="50" id="ani-logo"/>
                          </span>
                        </span>      
                          <span>Welcome to Kagay-an Beauty Lounge! </span>
                          <span>For your appointments visit https://appointment.kagay-an.ph or Call 09664426225</span><img src="https://kblapp.kagay-an.ph/img/logo.47f76915.png" width="50" height="50" id="ani-logo"/>
                        
                   
                 </marquee>
              
              </div>
    </div>
  </div>
    <!--Stats cards-->
    <loader v-if="loader"/> 

    
        
  </div>
</template>
<script>
import { StatsCard, ChartCard } from "@/components/index";
import Loader from "@/components/Loader";
import axios from 'axios'
import api  from "@/static/config.json";

export default {
  components: {
    StatsCard,
    ChartCard,
    Loader
  },
  /**
   * Chart data used to render stats, charts. Should be replaced with server data
   */
  data() {
    return {
      statsCards: [

        {
          type: "success",
          icon: "ti-wallet",
          title: "Revenue",
          value: "PHP 0",
          footerText: "Last day",
          footerIcon: "ti-calendar",
        },
        {
          type: "info",
          icon: "ti-user",
          title: "Clients",
          value: "+45",
          footerText: "Updated now",
          footerIcon: "ti-reload",
        },
      ],
      activityChart: {
        data: {
          labels: ["1/20/2024", "1/21/2024", "1/23/2024"],
          series: [[1, 32, 100],[1, 32, 100],[1, 32, 100]]
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          height: "245px",
        },
      },
      preferencesChart: {
        data: {
          labels: ["62%", "32%", "6%"],
          series: [62, 32, 6],
        },
        options: {},
      },
      today_sale:0,
      total_client:0,
      appointments:[],
      loader:false,
      show_table: false,
      intervalId: '',
      current_time: '',
    };
  },
  methods:{
    
        async getAppointment(){
                  let self = this
                  let date = this.getDate();
                  await axios.get(api.API_URL+`/appointment?limit=20&from=${date}&to=${date}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  self.loader = false;
                  self.appointments = data
                  self.total_page = Math.ceil(data.total/limit);

                }).catch(({ response })=>{
                  if(response.data.error.code =='token_could_not_verified'){
                              localStorage.removeItem("token");
                              this.$router.push('/login')
                  }
                })

                  
        },getDate(){
            const today = new Date();
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1; // Months start at 0!
            let dd = today.getDate();

            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            const formattedToday = mm + '/' + dd + '/' + yyyy;
            return formattedToday;
        },
        getTime(){
          const today = new Date();
          const formattedTime = today.toLocaleTimeString().replace(/:\d+ /, ' ');
          this.current_time = formattedTime;
          return formattedTime;
            },
         myFunction() {
           this.show_table = true;
        },
        resetInterval() {
          // Clear the existing interval
          clearInterval(this.intervalId);

          this.show_table = false;

          // Set the interval again to run every 15 minutes
          this.intervalId = setInterval(this.myFunction, 5 * 60 * 1000); // 15 minutes in milliseconds
        }
  },
  mounted(){
      this.getAppointment()
      setInterval(() => {
           this.getTime();
      }, 60 * 1000);

      setInterval(() => {
        this.getAppointment();
      }, 300000);

      this.myFunction();

    // Set interval to run every 15 minutes
     this.intervalId = setInterval(this.myFunction, 5 * 60 * 1000); // 15 minutes in milliseconds
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed to avoid memory leaks
    clearInterval(this.intervalId);
  }
};
</script>
<style>
#todays .card-title{font-weight: bold; margin-bottom: 40px;}
.bg-video-wrap {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100vh;
  background: url(https://designsupply-web.com/samplecontent/vender/codepen/20181014.png) no-repeat center center/cover;
}
video {
  min-width: 100%;
  min-height: 100vh;
  z-index: 1;
}
.overlay {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
#time{
  position: absolute;
  bottom: 92px;
  background-color: #d2b244;
  z-index: 3;
  width: 30%;
  left: 72%;
  font-size: 30px;
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 20px;
  border:3px solid #008080;
}
#sched {
  text-align: center;
  color: #fff;
  text-shadow: 2px 2px #000000;
  font-size: 45px;
  font-weight: bold;
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 3;
  width: 100%;
  background-color: #d2b244;
  border-top: 3px solid #008080;
  border-bottom: 3px solid #008080;
}
#sched .card{background: none!important;}
#sched .table-striped tbody > tr{background: none!important;}
#sched .table{color:#fff; text-shadow: 2px 2px #000000;}
#todays .card-title{color:#fff;}
#todays .card-title {font-size: 28px; text-shadow: 2px 2px #000000;}
#marquee-cont {
  background: #f4f4f4;
  margin-top:10px;
}
#marquee-cont marquee {
  margin-top: 5px;
}
#marquee-news {
  
  background: #1174A8;
  padding: 5px;
}
#ticker-title{
  border:none;
  padding:5px 20px;
  background:#1174A8;
  color:white;
}
#ticker-title:focus{
  outline:none;
}

#sched span{display: inline-block; margin-right: 80px;}
#ani-logo{margin-left:50px;}
#tb{width: 40%; width: 40%; position: absolute; bottom: 174px; left:0; font-size: 20px;}
#header-app{text-shadow: 2px 2px #000000; }
</style>
