import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const USERNAME = 'SimCena';

@Injectable({
  providedIn: 'root'
})
export class ChessComDataHandlerService {

  constructor(private httpClient: HttpClient) { }

  getGames(){
    const baseUrl = "https://api.chess.com/pub/player/" + USERNAME + "/games/";
    const archivesUrl = baseUrl + 'archives';
    return this.httpClient.get(archivesUrl);
  }

  getDataFromUrl(url: string):any {
    return this.httpClient.get(url);
  }
}
// #read the archives url and store in a list
// f = urllib.request.urlopen(archivesUrl)
// archives = f.read().decode("utf-8")
// archives = archives.replace("{\"archives\":[\"", "\",\"")
// archivesList = archives.split("\",\"" + baseUrl)
// archivesList[len(archivesList)-1] = archivesList[len(archivesList)-1].rstrip("\"]}")

// #download all the archives
// for i in range(len(archivesList)-1):
//     url = baseUrl + archivesList[i+1] + "/pgn"
//     filename = archivesList[i+1].replace("/", "-")
//     urllib.request.urlretrieve(url, "/Users/Magnus/Desktop/My Chess Games/" + filename + ".pgn") #change
//     print(filename + ".pgn has been downloaded.")
// print ("All files have been downloaded.")