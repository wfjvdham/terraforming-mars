import requests
import random
import time

domain = 'http://localhost:8080'
player_id = 'id=p80ec894d6c34'
get_options = domain + '/api/player?' + player_id
send_action = domain + '/player/input?' + player_id

while True:

    response = requests.get(get_options)

    try:
        waitingFor = response.json()['waitingFor']

        if 'options' in waitingFor:
            print('pick an action')
            action_options = waitingFor['options']
            n_action_options = len(action_options)
            do_action = random.randint(0, n_action_options - 1)
            action = action_options[do_action]
            try:
                sub_action_options = action['options']
                n_sub_action_options = len(sub_action_options)
                do_sub_action = random.randint(0, n_sub_action_options - 1)
                data = [[do_action], [do_sub_action]]
            except:
                data = [[do_action]]

        elif 'maxCardsToSelect' in waitingFor:
            print('pick card')
            n_cards_to_select = random.randint(waitingFor['minCardsToSelect'], waitingFor['maxCardsToSelect'])
            positions = random.sample(range(len(waitingFor['cards'])), n_cards_to_select)
            the_list = list(range(len(waitingFor['cards'])))
            selection = [1 if i in positions else 0 for (i, _) in enumerate(the_list)]
            selected_cards = [waitingFor['cards'][i]['name'] for i in positions]
            data = [selected_cards]
        else:
            print('not implemented')
        print(data)
        response = requests.post(url = send_action, data = str(data).replace("'", '"'))
    except:
        print('waiting 2 secs before trying again')
        time.sleep(2)
    