/* 
* @Author: anchen
* @Date:   2020-11-04 16:04:52
* @Last Modified by:   anchen
* @Last Modified time: 2020-11-04 17:02:25
*/

function loadListenner(){
      const baseURI = "https://pd.zwc365.com"
      function checkUrl(instr){
        if(!instr || instr == '/' || instr.length<=0){
          alert("请输入正确的文件链接")
          return false
        }
        if(instr.endsWith(".git")){
          alert("Git 项目请查阅项目说明中命令行Clone选项")
          return false
        }
        return true
      }
      function toSubmit(e) {
        return openDownloadUrl(e, baseURI + "/cfdownload/")
      }
      function toSubmit2(e) {
        return openDownloadUrl(e, baseURI + "/seturl/")
      }
      function openDownloadUrl(e, baseUrl){
        e.preventDefault()
        let inputUrl = document.getElementsByName("q")[0].value
        if (checkUrl(inputUrl)) {
            window.open(baseUrl + inputUrl.trim())
        }
        return false
      }
      window.onload = function () {
        window.addEventListener("keyup", function (e) {
          var event = e || window.event
          var key = event.which || event.keyCode || event.charCode
          if (key == 13) {
            toSubmit(e)
          }
        })
        document.querySelector("#sub-btn1").addEventListener("click", toSubmit)
        document.querySelector("#sub-btn2").addEventListener("click", toSubmit2)
      }
}

loadListenner();
