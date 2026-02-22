
import matplotlib.pyplot as plt
import numpy as np
import cv2

def plot_to_image(fig):
    """
    Converts a matplotlib figure to a numpy array (OpenCV image).
    """
    fig.canvas.draw()
    # Get the RGBA buffer from the figure
    w, h = fig.canvas.get_width_height()
    buf = np.frombuffer(fig.canvas.tostring_argb(), dtype=np.uint8)
    buf.shape = (h, w, 4)

    # RGBA to RGB (dropping alpha channel) and then RGB to BGR for OpenCV
    buf = np.roll(buf, 3, axis=2) # ARGB to RGBA
    image = cv2.cvtColor(buf[:, :, :3], cv2.COLOR_RGB2BGR)
    plt.close(fig) # Close the figure to free up memory
    return image

def create_rppg_plot_image(times, raw_signal, filtered_signal, bpm, width, height):
    """
    Generates a matplotlib plot for rPPG signal and converts it to an OpenCV image.
    """
    fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)

    if len(times) > 0 and len(raw_signal) > 0:
        ax.plot(times, raw_signal, label='Raw RGB Signal', color='lightgray', alpha=0.6)
        if len(filtered_signal) == len(times):
            ax.plot(times, filtered_signal, label='Filtered Pulse', color='red')
        ax.set_title(f'rPPG Signal (BPM: {bpm:.1f})')
        ax.set_xlabel('Time (s)')
        ax.set_ylabel('Intensity')
        ax.legend(loc='upper right')
        ax.set_facecolor('#282c34') # Dark background for plot
    else:
        ax.text(0.5, 0.5, 'No rPPG Data', horizontalalignment='center', verticalalignment='center', transform=ax.transAxes, color='white', fontsize=12)
        ax.set_title('rPPG Signal')

    fig.patch.set_facecolor('#282c34') # Dark background for figure
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')
    ax.spines['left'].set_color('white')
    ax.spines['bottom'].set_color('white')
    ax.title.set_color('white')
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white')
    ax.legend(labelcolor='white')

    plt.tight_layout()
    img = plot_to_image(fig)
    return img

# Placeholder for other plot functions (e.g., HRV, Spectrogram)
def create_hrv_plot_image(hrv_data, width, height):
    fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
    ax.text(0.5, 0.5, 'HRV Plot Placeholder', horizontalalignment='center', verticalalignment='center', transform=ax.transAxes, color='white', fontsize=12)
    fig.patch.set_facecolor('#282c34')
    ax.set_facecolor('#282c34')
    ax.title.set_color('white')
    img = plot_to_image(fig)
    return img

def create_spectrogram_image(audio_data, sr, width, height):
    fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
    ax.text(0.5, 0.5, 'Spectrogram Placeholder', horizontalalignment='center', verticalalignment='center', transform=ax.transAxes, color='white', fontsize=12)
    fig.patch.set_facecolor('#282c34')
    ax.set_facecolor('#282c34')
    ax.title.set_color('white')
    img = plot_to_image(fig)
    return img
