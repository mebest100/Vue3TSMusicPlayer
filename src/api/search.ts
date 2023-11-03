import axios from 'axios'
import request from '@/utils/request'
import type { HotKeyResp, SearchReq } from '@/types/api/search'

export default class SearchServer {
  static getHotKeys (): Promise<HotKeyResp> {
    return request.request({
      url: '/getHotKeys',
      method: 'get'
    })
  }

  static search (params: SearchReq): Promise<any> {
    const url = '/api/NetEaseSearch'
    return axios.get(url, { params }).then(res => {
      return Promise.resolve(res.data)
    })
  }
}
