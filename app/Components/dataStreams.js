import React from 'react'
import { reportEndApiCall } from '../utils/endApi'

const DataStreams = () => {

    const endapiall = {
        "dimensions": [{ "name": "streamId" }, { "name": "streamName" }],
        "metrics": [{ "name": "activeUsers" }],
        "dateRanges": [{ "startDate": '2025-02-08', "endDate": '2025-03-09' }],
        "keepEmptyRows": true
    };

    reportEndApiCall(endapiall)

    return (
        <div>
            <div>
                <h1>Tagging & Configuration</h1>
                <div>
                    <h1>Data Streams</h1>
                    <div>
                        <table>
                            <tr>
                                <th></th>
                                <th><span
                                    >android</span><br></br>
                                        Android Streams </th>
                                <th><span
                                    >language</span><br></br>
                                        Web Streams </th>
                                <th><span
                                    >ios</span><br></br>
                                        iOS Streams </th>
                            </tr>
                            <tr>
                                <td><b># of streams</b></td>
                                <td>Android configured streams</td>
                                <td>Web configured stream</td>
                                <td>iOS configured streams</td>
                            </tr>
                            <tr>
                                <td><b>Active streams</b></td>
                                <td>NA</td>
                                <td>NA</td>
                                <td>NA</td>
                            </tr>
                            <tr>
                                <td><b>Measurement Id / App Id</b></td>
                                <td>NA</td>
                                <td>NA</td>
                                <td>NA</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataStreams
