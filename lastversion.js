var request = {}
var channelready = false;
var channelgroup = [];
var daterange = [];
var weekrange = [];
var monthrange = [];
var quarterrange = [];
var yearrange =[];
var scrollLen = 0;
var scrollNum = 0;
var periodcheck = false;
var magicType = 'bar';
var activeChannel = 0;
var activePlatForm = 0;
var activeFlag = false;
var clickedCell = 0;
var sort = '000';
var WPeriod = '';
var wto;
var filterexist = false;
var box = '';
var navmodule = {
  /*
  ===== Initialize navigation
  */
  initnav : function(ChannelID,formID,PeriodType){
    if(channelready == false){
      /*
      ===== first step initialize Channel group and show when channel view = Separated
      ===== Ajax req for channel group
      */
      var promise = $.get(window.location.href + "channelgroup", request).then(function(data){
        $('#'+formID).find('option').remove();
        var selectBox = document.getElementById(formID);

        for(var i in data){
          channelgroup.push({ChannelGroupID : data[i].ChannelGroupID, ChannelGroupName : data[i].ChannelGroupName})
          selectBox.options.add(new Option(data[i].ChannelGroupName,  data[i].ChannelGroupID));
        }
        $('#'+formID).val(1000)
        /*
        ===== Ajax request for period range
        ===== initialize period range after the request
        */
        return $.get(window.location.href + "periodrange", request);
      }).then(function(data){
          var counter = 0
          for(var i in data){
            if(data[i].ProgDate != -1){
              switch(counter){
                case 0 :
                  /*
                  ===== default period and default scrollLength
                  */
                  daterange.push(navmodule.convertProgdate(data[i].ProgDate))                                
                  scrollLen = daterange.length - 1;
                  daterange.sort(function(a, b){return b-a});
                  break;
                case 1 :
                  weekrange.push(data[i].ProgDate)
                  weekrange.sort(function(a, b){return b-a});
                  break;
                case 2 :
                  monthrange.push(data[i].ProgDate)
                  monthrange.sort(function(a, b){return b-a});
                  break;
                case 3 :
                  quarterrange.push(data[i].ProgDate)
                  quarterrange.sort(function(a, b){return b-a});
                  break;
                case 4 :
                  yearrange.push(data[i].ProgDate)
                  yearrange.sort(function(a, b){return b-a});
                  break;
              }              
            }else{
              counter++;
            }
          }
                    
          $('#customperiod').val(daterange[0])

          var ChannelGroupID = $('#channelgroup').val()
          var PeriodTypeID = $('#periodtype').val();
          var Period = daterange[0]

          request = {
            ChannelGroupID : ChannelGroupID,
            PeriodTypeID : PeriodTypeID,
            Period : Period,
          }

          console.log(request)
          navmodule.scrollproperty()
          return $.get(window.location.href + "channelperformance", request);

      }).then(function(data){
        channelready = true;
        //navmodule.init_ChannelPerformance(data,$('#channelgroup').val())
      })
    }
  },
  /*
  ===== change performance
  */
  convertProgdate : function(progdate){
    progdate = progdate.toString();
    var newdate = progdate.substring(6,8)+""+progdate.substring(4,6)+""+progdate.substring(2,4)
    console.log(newdate)
    return newdate
  },
  externalProgdate : function(progdate){
    progdate = progdate.toString();
    var newdate = "20"+progdate.substring(4,6)+""+progdate.substring(2,4)+""+progdate.substring(0,2) 
    console.log(newdate)
    return newdate
  },
  ChannelPerformanceRequest : function(){
    var ChannelGroupID = $('#channelgroup').val()
    var PeriodTypeID = $('#periodtype').val();
    if(WPeriod != ''){
      var Period = WPeriod
    }else{
      if(PeriodTypeID == 1){
        var period = navmodule.externalProgdate($('#customperiod').val())
      }else{
        var Period = $('#customperiod').val();
      }          
    }
    
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }
    request = {
      ChannelGroupID : ChannelGroupID,
      PeriodTypeID : PeriodTypeID,
      Period : Period,
      ChannelGroupID : ChannelGroupID,
      Filter : filter
    }
    console.log(request)
    $.get(window.location.href + "channelperformance", request, function(data){
      navmodule.init_ChannelPerformance(data,ChannelGroupID)
    });
  },
  /*
  ===== initialize performance
  */
  init_ChannelPerformance : function(data,ChannelGroupID){
    if(data.length > 0){
      loadingstate()
      console.log(data)
      var ChannelID = [];
      var PlatformName = [];
      for(var i in data){
        var TempChannelID = ChannelGroupID != 2000 ? data[i].ChannelID : data[i].ChannelGroupID;
        ChannelID.push(TempChannelID)
        PlatformName.push(data[i].PlatFormName)
      }
      ChannelID = _.uniq(ChannelID);
      var Formname = _.uniq(PlatformName);
      var PerformanceChannels = []
      var totalLinear = 0;
      for(var i in ChannelID){

        var Channels = [];
        var ChannelName = "";
        for(var x in data){        
          if(ChannelGroupID != 2000){
            var TempChannelID = data[x].ChannelID;
          }else{
            var TempChannelID = data[x].ChannelGroupID;
          }

          if(TempChannelID == ChannelID[i]){
            if(ChannelGroupID != 2000){
                ChannelName = ChannelName == "" ? data[x].ChannelName : data[x].ChannelName ;
            }else{
                ChannelName = ChannelName == "" ? data[x].ChannelGroupName : data[x].ChannelGroupName ;
            }
            if(data[x].PlatFormID == 1){
              if($('#unit').val() == 1){
                var avg = Number(data[x].Sum000).toFixed(2)
              }else{
                var avg = Number(data[x].SumATV).toFixed(2)
              }          
              totalLinear = Number(totalLinear) + Number(avg)
            }

            Channels.push({
              PlatFormID : data[x].PlatFormID,
              PlatFormName : data[x].PlatFormName,
              Sum000 : data[x].Sum000,
              SumATV : data[x].SumATV,
            })
          }
        }

        PerformanceChannels.push({
          ChannelID : ChannelID[i],
          ChannelName : ChannelName,
          Channels : Channels,
        })

      }
      console.log(PerformanceChannels)
      var delivered = false;
      var totalCell = false;
      var tdwidth = 100 / (Formname.length + 2)

      var GetChannelIDs = [];
      var GetPlatFormIDs = [];
      for(var i in PerformanceChannels){
        GetChannelIDs.push(PerformanceChannels[i].ChannelID)
        for(var x in PerformanceChannels[i].Channels){
          GetPlatFormIDs.push(PerformanceChannels[i].Channels[x].PlatFormID)
        }
      }    

      var output = '<table class="table-bordered table-channelperformance" id="table-channelperformance" width="100%">';
        output += '<thead class="bg-white"><tr><td width="250"></td>';
      for(var i in Formname){
        output += '<td class="text-center"><img height="50" src="channel/'+ Formname[i] +'.png" alt="'+ Formname[i] +'"></td>';
      }
        output += '<td class="text-center bg-light" width="150"><img width="40" src="channel/globe.png" class="img-responsive">&nbsp;&nbsp;<small>TOTAL</small></td>';
        output += '</tr></thead><tbody>';
      for(var i in PerformanceChannels){
        var logo = PerformanceChannels[i].ChannelName.replace('.', '-');
        if($('#channelgroup').val() == 1){
          var size = 30
        }else{
          var size = 40
        }
        var totalAvgVal = 0;
        output += '<tr>';
        output += '<td>'+ PerformanceChannels[i].ChannelName +'<img width="30" class="float-right" src="logo/'+ logo.replace('+', '-') +'.png" class="img-responsive"></td>';
        for(var x in Formname){

          var flag = false;        
          for(var p in PerformanceChannels[i].Channels){
            if(PerformanceChannels[i].Channels[p].PlatFormName == Formname[x]){
              var PFormID = PerformanceChannels[i].Channels[p].PlatFormID;
              
              flag = true;
              console.log(delivered + "/" + $.inArray( activeChannel , GetChannelIDs ) + "/" + $.inArray( activePlatForm , GetPlatFormIDs ))
              if(delivered == false && $.inArray( activeChannel , GetChannelIDs ) == -1 || $.inArray( activePlatForm , GetPlatFormIDs ) == -1){
                if(ChannelGroupID != 2000){
                  var ChGroupID = -1;
                  var ChID = PerformanceChannels[i].ChannelID
                  activeChannel = ChID
                }else{
                  var ChGroupID = PerformanceChannels[i].ChannelID
                  var ChID = -1;
                  activeChannel = ChGroupID
                }
                activePlatForm = PFormID;
                var PFormID = PFormID
                var PtypeID = $('#periodtype').val()
                if(WPeriod != ''){
                  var Prange = WPeriod
                }else{
                  if(PtypeID == 1){
                    var Prange = navmodule.externalProgdate($('#customperiod').val())
                  }else{
                    var Prange = $('#customperiod').val()
                  }                  
                }              
                navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,PerformanceChannels[i].ChannelName,Formname[x],sort)
                navmodule.init_trending(-1,ChGroupID,ChID,PtypeID,Prange,PFormID,PerformanceChannels[i].ChannelName, Formname[x])
                delivered = true;
                var activecell = 'active'
              }else if(activeChannel == PerformanceChannels[i].ChannelID && activePlatForm == PFormID){
                if(ChannelGroupID != 2000){
                  var ChGroupID = -1;
                  var ChID = PerformanceChannels[i].ChannelID
                  activeChannel = ChID
                }else{
                  var ChGroupID = PerformanceChannels[i].ChannelID
                  var ChID = -1;
                  activeChannel = ChGroupID
                }
                activePlatForm = PFormID;
                var PFormID = PFormID
                var PtypeID = $('#periodtype').val()
                if(WPeriod != ''){
                  var Prange = WPeriod
                }else{
                  if(PtypeID == 1){
                    var Prange = navmodule.externalProgdate($('#customperiod').val())
                  }else{
                    var Prange = $('#customperiod').val()
                  } 
                }  
                navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,PerformanceChannels[i].ChannelName,Formname[x],sort)
                navmodule.init_trending(-1,ChGroupID,ChID,PtypeID,Prange,PFormID,PerformanceChannels[i].ChannelName + " - " +Formname[x])
                delivered = true;
                var activecell = 'active rounded'
              }else{
                var activecell = ''
              }

              if($('#unit').val() == 1){
                var avgval = Number(PerformanceChannels[i].Channels[p].Sum000).toFixed(2)              
              }else{
                var avgval = Number(PerformanceChannels[i].Channels[p].SumATV).toFixed(2)              
              }
              totalAvgVal = Number(totalAvgVal) + Number(avgval)

              output += '<td class="'+ activecell +'" id="'+PerformanceChannels[i].ChannelID+'" value="'+ PFormID +'" data-id="'+PerformanceChannels[i].ChannelName+'" data-value="'+ Formname[x] +'">'+ avgval + '</td>';

              break;
            }
          }

          if(flag == false){
            output += '<td> - </td>';
          }

        }
        if(activePlatForm == -1 && activeChannel == PerformanceChannels[i].ChannelID){
          var activeTotalCell = 'active rounded'
        }else{
          var activeTotalCell = ''
        }
        output += '<td class="'+ activeTotalCell +' bg-light" id="'+PerformanceChannels[i].ChannelID+'" value="-1" data-id="'+PerformanceChannels[i].ChannelName+'" data-value="Total">'+ Number(totalAvgVal).toFixed(2) +'</td>';
        output += '</tr>';
      }
      
      output += '<tr class="bg-light">'
      output += '<td class="align-middle"><img width="40" src="channel/globe.png" class="img-responsive">&nbsp;&nbsp;TOTAL</td>';
      //id="'+PerformanceChannels[i].ChannelID+'" value="-1" data-id="Linear" data-value="Total"
      output += '<td class="text-center">'+ totalLinear.toFixed(2) +'</td>'
      output += '<td class="border-top-0" colspan="'+ Formname.length +'"></td>'
      output += '</tr>'
      output += '</tbody></table>';
      $('#channelperformance').html(output)
      var channeltable = ($('#channelperformance').width() - 280) / Formname.length
      $('#channelperformance td:not(:first-child)').css({
        width : channeltable+'px',
      })
      var $table = $('table#table-channelperformance');
      $table.floatThead();      
      $('#table-channelperformance td:not(:first-child)').each(function(){
        $(this).click(function(){
          if($(this).attr("id")!= undefined){

            $('#table-channelperformance td:not(:first-child)').each(function(){
              $(this).removeClass('active')
            })
            $(this).addClass('active')
            if(ChannelGroupID != 2000){
              var ChGroupID = -1;
              var ChID = $(this).attr("id");
            }else{
              var ChGroupID = $(this).attr("id");
              var ChID = -1;
            }
            var ProgTitleID = -1;
            var PFormID = $(this).attr("value")
            var PtypeID = $('#periodtype').val()
            if(WPeriod != ''){
              var Prange = WPeriod
            }else{
              if(PtypeID == 1){
                var Prange = navmodule.externalProgdate($('#customperiod').val())
              }else{
                var Prange = $('#customperiod').val()
              } 
            }  
                      
            activeChannel = $(this).attr("id");
            activePlatForm = $(this).attr("value")          
            loadingstate()
            if(PFormID != -1){
              navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,$(this).data('id'),$(this).data('value'))
            }          
            navmodule.init_trending(ProgTitleID,ChGroupID,ChID,PtypeID,Prange,PFormID,$(this).data('id') + ' - ' + $(this).data('value'))          

          }
        })
      })
    }else{
      $('#channelperformance').html('')
      $('#programeperformance').html('')
      $('#bargraph').html('')
    }    
  },
  /*
  ===== programme performance
  */
  init_ProgrammePerformance : function(ChGroupID,ChID,PFormID,PtypeID,Prange,ChannelName,FormName,SumSort){
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }
    request = {
      ChannelGroupID : ChGroupID,
      ChannelID : ChID,
      PlatFormID : PFormID,
      PeriodTypeID : PtypeID,
      Period : Prange,
      Filter : filter
    }
    console.log(request)
    $.get(window.location.href + "programmeperformance", request, function(data){
      if(SumSort == '000'){
        data.sort(function(a, b) {
          return b.Sum000 - a.Sum000;
        });
        var sort000 = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
        var sortCount = ''
        var sortATV = ''
      }else if(SumSort == 'Count'){
        data.sort(function(a, b) {
          return b.CNT - a.CNT;
        });
        var sort000 = ''
        var sortCount = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
        var sortATV = ''
      }else{
        data.sort(function(a, b) {
          return b.SumATV - a.SumATV;
        });
        var sort000 ='';
        var sortCount = ''
        var sortATV = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
      }      
      var output = '<table class="table table-bordered" id="table-programmeperformance" width="100%">';
      var cname = ChannelName.replace('.', '-');
      var form ='<img height="30" src="channel/'+ FormName +'.png" class="float-right" alt="'+ FormName +'">'
      output += '<thead class="bg-white">'+
        '<tr>'+
          '<td width="350"><img height="30" src="logo/'+ cname.replace('+', '-') +'.png">'+ form +'</td>'+
          '<td></td>'+
          '<td></td>'+
          '<td></td>'+
        '</tr>'+
        '<tr>'+
          '<td>Programme Title</td>'+
          '<td id="sort" value="Count">Count'+ sortCount +'</td>'+
          '<td id="sort" value="000">000'+ sort000 +'</td>'+
          '<td id="sort" value="ATV">ATV'+ sortATV +'</td>'+
        '</tr></thead><tbody>';
      
      for(var i in data){      
      output += '<tr id="'+ data[i].ProgrammeTitleID +'" value="'+ data[i].ProgrammeTitle +'">'+
          '<td>'+ data[i].ProgrammeTitle+'</td>'+
          '<td>'+data[i].CNT+'</td>'+
          '<td>'+ Number(data[i].Sum000).toFixed(2) +'</td>'+
          '<td>'+ Number(data[i].SumATV).toFixed(2) +'</td>'+
        '</tr>';
      }      
      output += '</tbody></table>'
      $('#programeperformance').html(output)               
      $('#table-programmeperformance #sort').each(function(){
        $(this).click(function(){   
          sort = $(this).attr('value')                      
          navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,ChannelName,FormName,$(this).attr('value'))
        })
      })
      $('#table-programmeperformance tr').each(function(){
        var ChannelGroupID = $('#channelgroup').val();
        $(this).click(function(){
          if($(this).attr("id")!= undefined){
            $('#table-programmeperformance tr').each(function(){
              $(this).removeClass('active')
            })
            $(this).addClass('active')           
            var ProgTitleID = $(this).attr('id') 
            loadingstate()           
            navmodule.init_trending(ProgTitleID,ChGroupID,ChID,PtypeID,Prange,PFormID,$(this).attr('value') + " ( " + ChannelName+" - "+FormName +" ) ")                    
          }
        })
      })
      var $table = $('table#table-programmeperformance');      
      $table.floatThead({
        responsiveContainer: function($table){
            return $table.closest('.table-responsive');
        }
      });
    })
  },
  init_trending : function(ProgTitleID,ChGroupID,ChID,PtypeID,Prange,PFormID,TrendingTitle){
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }
    request = {
      ProgTitleID : ProgTitleID,
      ChannelGroupID : ChGroupID,
      ChannelID : ChID,
      PeriodTypeID : PtypeID,
      Period : Prange,
      PlatFormID : PFormID,
      Filter : filter,
    }
    console.log(request)    
    $.get(window.location.href + "trending", request, function(data){
      console.log(data)

      var chartval = []
      var label = []
      var dataseries = []      
      var PlatFormIDnum = [];
      var num = $('#periodtype').val()
      for(var i in data){        
        PlatFormIDnum.push(data[i].PlatFormID)
        switch(num){
          case '1' :        
            label.push(data[i].ProgDate)
            break;
          case '2' :
            label.push(data[i].WeekNumber)
            break;
          case '3' :
            label.push(data[i].MonthNumber)
            break;
          case '4' :
            label.push(data[i].QuarterNumber)
            break;
          case '5' :        
            label.push(data[i].YearNumber)
            break;
        }                        
      }

      var PFormIDs = _.uniq(PlatFormIDnum)
      var colorpick = ['#000','#a643c6','#ea5712','#110bc4']
      var colorpick1 = ['','#000','#a643c6','#ea5712','#110bc4']
      if(PFormIDs.length == 1){
        var average = [];
        for(var i in data){          
          if($('#unit').val() == 1){
            average.push(Number(data[i].Sum000).toFixed(2))
          }else{
            average.push(Number(data[i].SumATV).toFixed(2))
          }
        }
        dataseries = [{
          name: "Sample title",
          type: magicType,
          data: average,
          stack : 'stack',
          label: {
              normal: {
                  show: false,
                  color : '#000',
                  fontSize: 9,
                  position: 'top',
                  formatter : '{c}'
              }
          },
          itemStyle : {  
            normal: {
                barBorderWidth: 0,
                barBorderColor: colorpick1[PFormIDs[0]],
                color: colorpick1[PFormIDs[0]]
            },
            emphasis: {
              barBorderColor: colorpick1[PFormIDs[0]],
              color: colorpick1[PFormIDs[0]]
            }
          },
          markPoint: {
              clickable: true,
              symbol: 'pin',
              symbolSize: 80,
              symbolRotate: null,
              large: false
          }
        }]
        var topxAxis = average;
      }else{
        for(var i in PFormIDs){
          var average = []
          for(var x in data){
            if(PFormIDs[i] == data[x].PlatFormID){
              if($('#unit').val() == 1){
                average.push(Number(data[x].Sum000).toFixed(2))
              }else{
                average.push(Number(data[x].SumATV).toFixed(2))
              }
            }
          }        
          dataseries.push({
            name: "Sample title",
            type: magicType,
            data: average,
            stack : 'stack',
            label: {
                normal: {
                    show: false,
                    color : '#000',
                    fontSize: 9,
                    position: 'top',
                    formatter : '{c}'
                }
            },
            itemStyle : {  
              normal: {
                  barBorderWidth: 0,
                  barBorderColor: colorpick[i],
                  color: colorpick[i]
              },
              emphasis: {
                barBorderColor: colorpick[i],
                color: colorpick[i]
              }
            },
            markPoint: {
                clickable: true,
                symbol: 'pin',
                symbolSize: 80,
                symbolRotate: null,
                large: false
            }
          })
        }
        var topxAxis = []        
        var refdate = [];   
        for(var i in data){                
          switch(num){
            case '1' :        
              refdate.push(data[i].ProgDate)
              break;
            case '2' :
              refdate.push(data[i].WeekNumber)
              break;
            case '3' :
              refdate.push(data[i].MonthNumber)
              break;
            case '4' :
              refdate.push(data[i].QuarterNumber)
              break;
            case '5' :        
              refdate.push(data[i].YearNumber)
              break;
          }                        
        }           
        refdate = _.uniq(refdate)        
        for(var i in refdate){         
          var sum = 0;
          for(var x in data){
            switch(num){
              case '1' :        
                if(refdate[i] == data[x].ProgDate){         
                  if($('#unit').val() == 1){                
                    sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                  }else{
                    sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                  }                       
                }
                break;
              case '2' :
                if(refdate[i] == data[x].WeekNumber){         
                  if($('#unit').val() == 1){                
                    sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                  }else{
                    sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                  }                       
                }
                break;
              case '3' :
                if(refdate[i] == data[x].MonthNumber){         
                  if($('#unit').val() == 1){                
                    sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                  }else{
                    sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                  }                       
                }
                break;
              case '4' :
                if(refdate[i] == data[x].QuarterNumber){         
                  if($('#unit').val() == 1){                
                    sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                  }else{
                    sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                  }                       
                }
                break;
              case '5' :        
                if(refdate[i] == data[x].YearNumber){         
                  if($('#unit').val() == 1){                
                    sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                  }else{
                    sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                  }                       
                }
                break;
            }            
          }
          topxAxis.push(sum)
        }
        console.log(topxAxis)
        for(var i in topxAxis){
          topxAxis[i] = Number(topxAxis[i]).toFixed(2)
        }        
      }      
      


      var echartBar = echarts.init(document.getElementById('bargraph'));
      echartBar.on('magictypechanged', function(params) {
          magicType = params.currentType;
      });
      echartBar.setOption({
        title: {
            text: 'Trending: '+TrendingTitle,
            textStyle: {
                fontSize: 20,
                //fontFamily: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif',
                fontWeight: 'bolder',
                extraCssText: 'left: -20px'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            formatter: '{b}: {c}',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function(pos, params, el, elRect, size) {
               var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            show : false,
            extraCssText: 'width: 170px'
        },
        toolbox: {
            show: true,
            feature: {
                 mark : {show: true},  
                dataView: {
                    show: false,
                    title: "Text View",
                    lang: [
                        "Text View",
                        "Close",
                        "Refresh",
                    ],
                    readOnly: false
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar'],
                    title: {
                        line: 'Line Chart',
                        bar: 'Bar Chart',
                        stack: 'Stacked Chart',
                        tiled: 'Tiled Chart',
                    }
                },
                restore: {
                    show: false,
                    title: "Restore"
                },
                saveAsImage: {
                    show: true,
                    title: "Save Image"
                }
            }
        },
        legend: {
            data: ['Sample title'],
            show : false,            
        },
        grid: {
            left: '40',
            right: '0%',
            bottom: '40',
            top: '20%',
            containLabel: true
        },
        yAxis: {                    
            type: 'value',
            name: $("#unit option:selected").text(),
            nameLocation: 'middle',
            nameGap: 40,
            nameTextStyle : {
              fontSize : 19,
              fontWeight : 'bolder'
            },                
            scale: 3,
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            }
        },
        xAxis: [{
                type: 'category',
                data: _.uniq(label),                
                name: $("#periodtype option:selected").text(),
                nameLocation: 'middle',
                nameGap: 40,
                nameTextStyle : {
                  fontSize : 19,
                  fontWeight : 'bolder'
                }
            },
            {
                type: 'category',
                position: 'top',
                onZero: true,
                xAxisIndex: 1,
                yAxisIndex: 1,
                zAxisIndex: 1,
                scale: true,                                      
                axisLabel: {
                    show: true,
                    /*formatter: '{value}' + PutPctg(),
                    textStyle: {
                        color: function(v) {
                            if (v >= 0) {
                                return 'green'
                            } else {
                                return 'red'
                            }
                        }
                    },*/                                
                },
                data: topxAxis
            }
        ],
       calculable : true,
          series: dataseries
    });
    })
  },
  /*
  ===== Change value on period range
  */
  initperiod : function(periodtype){
    scrollNum = 0;
    switch(periodtype){
      case '1' :        
        scrollLen = daterange.length - 1;
        $('#customperiod').val(daterange[0])
        break;
      case '2' :
        scrollLen = weekrange.length - 1;
        $('#customperiod').val(weekrange[0]) 
        break;
      case '3' :
        scrollLen = monthrange.length - 1;
        $('#customperiod').val(monthrange[0])
        break;
      case '4' :
        scrollLen = quarterrange.length - 1;
        $('#customperiod').val(quarterrange[0])
        break;
      case '5' :        
        scrollLen = yearrange.length - 1;
        $('#customperiod').val(yearrange[0])
        break;
    }
    navmodule.scrollproperty()
  },
  periodscroll : function(scrollType){
    if(scrollType == 'prev'){
      if(scrollLen > scrollNum){
        scrollNum++;
      }
    }else{
      if(scrollNum > 0){
        scrollNum--;
      }
    }
    var num = $('#periodtype').val()
    switch(num){
      case '1' :        
        $('#customperiod').val(daterange[scrollNum])
        break;
      case '2' :
        $('#customperiod').val(weekrange[scrollNum])        
        break;
      case '3' :
        $('#customperiod').val(monthrange[scrollNum])        
        break;
      case '4' :
        $('#customperiod').val(quarterrange[scrollNum])        
        break;
      case '5' :        
        $('#customperiod').val(yearrange[scrollNum])        
        break;
    }   
    navmodule.scrollproperty()
  },
  scrollproperty : function(){
    navmodule.ChannelPerformanceRequest()
    if(scrollNum == 0 && scrollLen > 0){
      $('#next').prop('disabled',true)
      $('#prev').prop('disabled',false)
    }else if(scrollNum == 0 && scrollLen == 0){
      $('#prev').prop('disabled',true)
      $('#next').prop('disabled',true)
    }else if(scrollNum == scrollLen){
      $('#next').prop('disabled',false)
      $('#prev').prop('disabled',true)
    }else{
      $('#prev').prop('disabled',false)
      $('#next').prop('disabled',false)
    }
  }
}
/*
===== show/hide when channelgroup type ID is 1 or not
*/
function holdervisibility(ChannelID){
  if(ChannelID == 1){
    $('#channelgroupholder').fadeIn()
  }else{
    $('#channelgroupholder').fadeOut()
  }
}
function loadingstate(){
  box = bootbox.dialog({
    message: '<p class="text-center align-middle">Loading data . .</p>',
    closeButton: false,
  });
  var dialog = box.find('.modal-dialog');
  box.css('display', 'block');    
  dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2)); 
  $(document).ajaxStop(function() {    
    box.modal('hide')        
  });
}
$(function(){  

  navmodule.initnav($('#channelgroup').val(),'channelgroup',$('#periodtype').val())
  /*
  ===== Bind trigger for channelgroup
  */  

  $('#channelview').on('change',function(){
    activeChannel = 0;
    activePlatForm = 0;
    holdervisibility($(this).val())
    navmodule.ChannelPerformanceRequest()
  })
  $('#channelgroup').on('change',function(){
    navmodule.ChannelPerformanceRequest()
  })
  /*
  ===== Bind trigger for period range
  */
  $('#periodtype').on('change',function(){
    WPeriod = ''    
    navmodule.initperiod($(this).val())
  })
  /*
  ===== Bind next period when #next is click
  */
  $('#next').click(function(){
    $('#customperiod').val('')
    WPeriod = ''
    navmodule.periodscroll('next')
  })
  /*
  ===== Bind pervious period when #prev is click
  */
  $('#prev').click(function(){
    $('#customperiod').val('')
    WPeriod = ''
    navmodule.periodscroll('prev')
  })
  /*
  ===== Bind prev and next when period changed
  */

  $('#unit').change(function(){
    navmodule.ChannelPerformanceRequest()
  })

  //daterange weekrange monthrange quarterrange yearrange 
  $('#customperiod').keyup(function(){
    var num = $('#periodtype').val()
    parsedperiod($(this).val())
    if(WPeriod == ''){
      periodrange(num)
    }      
  })

  $('#filterbmi').on('input',function(e){
    var filtertext = $(this).val()
    filterexist = false
    clearTimeout(wto);
    $('.dropdown-content').hide();
    wto = setTimeout(function() {      
      request = {
        InputFilter : filtertext
      }
      if(filtertext != ''){
        $.get(window.location.href + "filtertitle", request,function(data){
          if(data.length > 0){
            var output = '';
            for(var i in data){
              output += '<li data-value="'+data[i].ProgrammeTitle+'">'+ data[i].ProgrammeTitle +'</li>'
            }
            $('#list').html(output)
            $('#list li').each(function(){
              $(this).click(function(){                          
                $('#filterbmi').val($(this).data('value'))
                filterexist = true
                navmodule.ChannelPerformanceRequest()
                $('.dropdown-content').hide();
                $('#list').html('')
              })
            })
            $('.dropdown-content').show();          
          }else{
            $('.dropdown-content').hide();
          }
        })   
      }else{
        filterexist = false;
        navmodule.ChannelPerformanceRequest()
        $('.dropdown-content').hide();
        $('#list').html('')
      }
              
    }, 1000);    

  })
  function parsedperiod(cperiod){
    var character = cperiod.charAt(2)
    if(cperiod.length == 4 && $.isNumeric(cperiod)){
      WPeriod = '20' + '' + cperiod
      if($.inArray( WPeriod, weekrange ) != -1){                  
        $('#periodtype').val(2)           
        scrollNum = $.inArray( WPeriod, weekrange )                
      }
      navmodule.scrollproperty()
    }else if((cperiod.length == 4 || cperiod.length == 5) && (character == 'm' || character == 'M')){
      if(cperiod.length == 4){
        WPeriod = '20' + cperiod.substring(0, 2) + '0' + cperiod.substring(3, 4);        
      }else if(cperiod.length == 5){
        WPeriod = '20' + cperiod.substring(0, 2) + '' + cperiod.substring(3, 5);       
      }
      if($.inArray( WPeriod, monthrange ) != -1){                  
        $('#periodtype').val(3)           
        scrollNum = $.inArray( WPeriod, monthrange )        
      }
      navmodule.scrollproperty()
    }else{
      WPeriod = '';      
    }
  }

  function periodrange(num){    
    switch(num){
      case '1' :
        if($('#customperiod').val().length == 8){
          if($.inArray( $('#customperiod').val(), daterange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), daterange )            
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '2' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), weekrange ) != -1){            
            periodcheck = true;         
            scrollNum = $.inArray( $('#customperiod').val(), weekrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '3' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), monthrange ) != -1){            
            periodcheck = true;                        
            scrollNum = $.inArray( $('#customperiod').val(), monthrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '4' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), quarterrange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), quarterrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '5' :
        if($('#customperiod').val().length == 4){
          if($.inArray( $('#customperiod').val(), yearrange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), yearrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
    }
  }

})
