import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Headphones,
  Heart,
  Mail,
  MessageCircle,
  Settings2,
  Trash2,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useConfirm } from "../context/ConfirmContext";
import { MOODS } from "../config/moodPresentation";
import { MoodMark } from "../components/MoodMark";

export function About() {
  const { resetSession, searchResult, lastQuery, triggerToast } = useApp();
  const confirm = useConfirm();
  const clearSession = async () => {
    if (
      await confirm({
        title: "Clear this listening session?",
        description:
          "This removes your recent mood text and mix from this browser and stops playback. Your liked songs and accounts stay saved.",
        confirmLabel: "Clear session",
        cancelLabel: "Keep session",
      })
    ) {
      resetSession();
      triggerToast("Listening session cleared. Ready for a new feeling.");
    }
  };
  return (
    <div className="page-shell about-page">
      <div className="about-intro">
        <span className="eyebrow">MORE THAN A SEARCH BAR</span>
        <h1 tabIndex={-1}>
          You bring the feeling.
          <br />
          <span className="gradient-text">We bring the music.</span>
        </h1>
        <p className="lead">
          Some days you know exactly what you need to hear.
          <br />
          On the other days, there’s Deezire.
        </p>
      </div>
      <div className="about-story">
        <span className="eyebrow">WHY WE’RE HERE</span>
        <p>
          Music has a way of meeting us where we are. Deezire starts with how
          you feel, then helps you find songs to match that moment—or move it
          somewhere new.
        </p>
        <span className="story-signature">
          A little discovery. A little more you.
        </span>
      </div>
      <div className="about-steps">
        {[
          {
            icon: MessageCircle,
            title: "Say how you feel.",
            text: "Write a few words, or choose from eight moods. We find a starting point; you can always change it.",
          },
          {
            icon: Waves,
            title: "Choose your direction.",
            text: "Feel it brings music that meets your mood. Shift it takes the energy somewhere different.",
          },
          {
            icon: Headphones,
            title: "Listen for something.",
            text: "Preview real songs from Deezer, save the ones you love, and open the full tracks on Deezer.",
          },
        ].map(({ icon: Icon, title, text }, i) => (
          <article key={title}>
            <div>
              <Icon size={23} />
              <span>0{i + 1}</span>
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="about-moods">
        <span className="eyebrow">A WHOLE SPECTRUM OF YOU</span>
        <div>
          {MOODS.map((mood) => (
            <span key={mood}>
              <MoodMark mood={mood} />
              {mood}
            </span>
          ))}
        </div>
      </div>
      <section className="faq-section">
        <h2>A few things to know.</h2>
        <details open>
          <summary>
            Do I need an account?
            <ChevronDown size={19} />
          </summary>
          <p>
            No. Discover music, play previews, and like songs as a guest. Guest
            likes stay in this browser. An account has its own separate
            collection; guest likes are not moved automatically.
          </p>
        </details>
        <details>
          <summary>
            Why are previews 30 seconds?
            <ChevronDown size={19} />
          </summary>
          <p>
            Deezire plays the preview clips provided by Deezer. Use the
            external-link button beside a track or in the player to continue on
            Deezer. Some tracks may not have an available preview.
          </p>
        </details>
        <details>
          <summary>
            How does Deezire understand my mood?
            <ChevronDown size={19} />
          </summary>
          <p>
            It starts with keyword matching. After your first typed submission,
            an emotion model can download and run in your browser on suitable
            connections. While it loads, or if it fails, keyword matching keeps
            working. Mood chips work without downloading the model. It can
            misread a feeling—you can always choose another mood.
          </p>
        </details>
        <details id="your-data">
          <summary>
            What happens to my data?
            <ChevronDown size={19} />
          </summary>
          <p>
            Your recent mood text, mix, and liked songs are saved in this
            browser. Emotion analysis happens on your device. Music discovery
            sends search terms to Deezer; unrecognized words from your input may
            be included. Album images and audio also come from Deezer.
          </p>
          <p>
            The current account feature is a local demo: it stores an email and
            a made-up password in this browser, without production security or
            verification. Use no real password. No email is sent, and accounts
            and likes do not sync between devices.
          </p>
        </details>
      </section>
      <section className="listening-settings">
        <div>
          <h2>
            <Settings2 size={21} />
            Your listening session
          </h2>
          <p>Start fresh by removing your recent mood text and mix.</p>
        </div>
        <button
          className="button secondary"
          disabled={!searchResult && !lastQuery}
          onClick={clearSession}
        >
          <Trash2 size={17} />
          Clear session
        </button>
      </section>
      <footer className="about-footer">
        <div>
          <Heart size={19} />
          <span>Made with feeling, by Dalitso Nyirenda.</span>
        </div>
        <a
          className="text-button"
          href="mailto:dalitsocoman@gmail.com?subject=Deezire%20Feedback"
        >
          <Mail size={16} />
          Share feedback
          <ArrowUpRight size={16} />
        </a>
        <Link className="text-button" to="/">
          Find your soundtrack
          <ArrowRight size={17} />
        </Link>
      </footer>
    </div>
  );
}
export default About;
