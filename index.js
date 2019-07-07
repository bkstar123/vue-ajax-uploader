/**
 * A Vue plugin for ajax file input
 *
 * @author: tuanha
 * @last-mod: 2019-07-07
 */
import Bks123FileInput from './components/Bks123FileInput.vue';

export default {
	install(Vue, options) {
		Vue.component('bks123-file-input', Bks123FileInput);
	}
}